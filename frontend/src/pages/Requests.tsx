import { useState, useEffect } from 'react';
import { X, Calendar, Clock, ArrowLeftRight, Check, List, Bell, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import UserProfile from '../components/UserProfile';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { swapAPI } from '../services/api';

type SwapRequest = {
	id: string;
	requesterName: string;
	requesterAvatar: string;
	theirEvent: {
		title: string;
		date: string;
		time: string;
	};
	yourEvent: {
		title: string;
		date: string;
		time: string;
	};
	timestamp: string;
};

type OutgoingSwapRequest = {
	id: string;
	recipientName: string;
	recipientAvatar: string;
	theirEvent: {
		title: string;
		date: string;
		time: string;
	};
	yourOffer: {
		title: string;
		date: string;
		time: string;
	};
	timestamp: string;
	status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
};

export default function Requests() {
	const { user, loading: authLoading } = useAuth();
	const { showToast } = useToast();
	const [requests, setRequests] = useState<SwapRequest[]>([]);
	const [outgoingRequests, setOutgoingRequests] = useState<OutgoingSwapRequest[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedRequest, setSelectedRequest] = useState<SwapRequest | null>(null);
	const [selectedOutgoingRequest, setSelectedOutgoingRequest] = useState<OutgoingSwapRequest | null>(null);
	const [confirmAction, setConfirmAction] = useState<{ type: 'accept' | 'reject'; id: string } | null>(null);

	useEffect(() => {
		if (user) {
			fetchRequests();
		}
	}, [user]);

	const fetchRequests = async () => {
		try {
			setLoading(true);
			const [incomingData, outgoingData] = await Promise.all([
				swapAPI.getIncomingRequests(),
				swapAPI.getOutgoingRequests(),
			]);

			// Transform incoming requests
			const transformedIncoming = incomingData.map((req: any) => ({
				id: req._id,
				requesterName: req.requesterUserId.name,
				requesterAvatar: req.requesterUserId.name.split(' ').map((n: string) => n[0]).join(''),
				theirEvent: {
					title: req.requesterSlotId.title,
					date: new Date(req.requesterSlotId.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
					time: `${req.requesterSlotId.startTime} - ${req.requesterSlotId.endTime}`,
				},
				yourEvent: {
					title: req.targetSlotId.title,
					date: new Date(req.targetSlotId.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
					time: `${req.targetSlotId.startTime} - ${req.targetSlotId.endTime}`,
				},
				timestamp: getTimeAgo(new Date(req.createdAt)),
			}));

			// Transform outgoing requests
			const transformedOutgoing = outgoingData.map((req: any) => ({
				id: req._id,
				recipientName: req.targetUserId.name,
				recipientAvatar: req.targetUserId.name.split(' ').map((n: string) => n[0]).join(''),
				theirEvent: {
					title: req.targetSlotId.title,
					date: new Date(req.targetSlotId.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
					time: `${req.targetSlotId.startTime} - ${req.targetSlotId.endTime}`,
				},
				yourOffer: {
					title: req.requesterSlotId.title,
					date: new Date(req.requesterSlotId.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
					time: `${req.requesterSlotId.startTime} - ${req.requesterSlotId.endTime}`,
				},
				timestamp: getTimeAgo(new Date(req.createdAt)),
				status: req.status,
			}));

			setRequests(transformedIncoming);
			setOutgoingRequests(transformedOutgoing);
		} catch (error: any) {
			showToast(error.message || 'Failed to fetch requests', 'error');
		} finally {
			setLoading(false);
		}
	};

	const getTimeAgo = (date: Date) => {
		const now = new Date();
		const diff = now.getTime() - date.getTime();
		const hours = Math.floor(diff / (1000 * 60 * 60));
		const days = Math.floor(diff / (1000 * 60 * 60 * 24));

		if (hours < 1) return 'just now';
		if (hours < 24) return `${hours}h`;
		return `${days}d`;
	};

	const handleAccept = (id: string) => {
		setConfirmAction({ type: 'accept', id });
	};

	const handleReject = (id: string) => {
		setConfirmAction({ type: 'reject', id });
	};

	const confirmAccept = async () => {
		if (!confirmAction) return;
		
		try {
			// Optimistically remove from requests
			setRequests(prev => prev.filter(req => req.id !== confirmAction.id));
			
			await swapAPI.respondToRequest(confirmAction.id, true);
			showToast('Swap request accepted! Events have been exchanged.', 'success');
			setSelectedRequest(null);
		} catch (error: any) {
			// Revert on error
			await fetchRequests();
			showToast(error.message || 'Failed to accept request', 'error');
		} finally {
			setConfirmAction(null);
		}
	};

	const confirmReject = async () => {
		if (!confirmAction) return;
		
		try {
			// Optimistically remove from requests
			setRequests(prev => prev.filter(req => req.id !== confirmAction.id));
			
			await swapAPI.respondToRequest(confirmAction.id, false);
			showToast('Swap request rejected', 'info');
			setSelectedRequest(null);
		} catch (error: any) {
			// Revert on error
			await fetchRequests();
			showToast(error.message || 'Failed to reject request', 'error');
		} finally {
			setConfirmAction(null);
		}
	};

	const handleCancelRequest = async (requestId: string) => {
		try {
			// Optimistically remove from outgoing requests
			setOutgoingRequests(prev => prev.filter(req => req.id !== requestId));
			
			await swapAPI.cancelRequest(requestId);
			showToast('Swap request cancelled', 'info');
		} catch (error: any) {
			// Revert on error
			await fetchRequests();
			showToast(error.message || 'Failed to cancel request', 'error');
		}
	};

	if (loading || authLoading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
					<p className="mt-4 text-gray-600">Loading requests...</p>
				</div>
			</div>
		);
	}

	if (!user) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
				<div className="text-center">
					<p className="text-gray-600 mb-4">Please log in to view requests</p>
					<Link
						to="/"
						className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
					>
						Go to Login
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-20 lg:pb-0">
			<div className="flex flex-col lg:flex-row">
				{/* Left Sidebar - Hidden on mobile */}
				<aside className="hidden lg:block w-72 min-h-screen bg-white border-r border-gray-200 p-6 sticky top-0">
					<div className="mb-8">
						<h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
							<span className="text-purple-600">📊</span> SlotSwapper
						</h1>
					</div>

					<div className="mb-8">
						<UserProfile name={user.name} email={user.email} avatar={user.avatar} />
					</div>

					<Sidebar />
				</aside>

				{/* Main Content */}
				<main className="flex-1 p-4 md:p-8">
					<div className="max-w-3xl mx-auto">
						{/* Header */}
						<header className="mb-6 md:mb-8 text-center">
							<h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Requests</h2>
							<p className="text-sm md:text-base text-gray-600">Manage incoming and outgoing swap requests</p>
						</header>

						{/* Incoming Requests */}
						<section className="mb-8 md:mb-12">
							<h3 className="text-lg md:text-xl font-bold text-gray-800 mb-4">Incoming Requests</h3>
							{requests.length === 0 ? (
								<div className="text-center py-12 md:py-16 px-4 bg-white rounded-lg">
									<p className="text-gray-500 text-sm md:text-base">No incoming swap requests</p>
								</div>
							) : (
								<div className="bg-white rounded-lg border divide-y">
									{requests.map((request) => (
										<div key={request.id} className="px-3 md:px-4 py-3">
											<div className="flex items-center justify-between gap-2">
												<div
													className="flex items-center gap-2 md:gap-3 flex-1 cursor-pointer min-w-0"
													onClick={() => setSelectedRequest(request)}
												>
													<div className="w-10 h-10 md:w-11 md:h-11 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xs md:text-sm flex-shrink-0">
														{request.requesterAvatar}
													</div>
													<div className="flex-1 min-w-0">
														<div className="flex items-center gap-2">
															<span className="font-semibold text-xs md:text-sm truncate">{request.requesterName}</span>
															<span className="text-gray-400 text-xs hidden sm:inline">• {request.timestamp}</span>
														</div>
														<p className="text-xs text-gray-500">wants to swap</p>
													</div>
												</div>
												<div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
													<button
														onClick={(e) => {
															e.stopPropagation();
															handleAccept(request.id);
														}}
														className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-3 md:px-4 py-1.5 rounded"
													>
														Accept
													</button>
													<button
														onClick={(e) => {
															e.stopPropagation();
															handleReject(request.id);
														}}
														className="text-gray-400 hover:text-gray-600 p-1"
													>
														<X className="w-4 h-4 md:w-5 md:h-5" />
													</button>
												</div>
											</div>
										</div>
									))}
								</div>
							)}
						</section>

						{/* Outgoing Requests */}
						<section>
							<h3 className="text-lg md:text-xl font-bold text-gray-800 mb-2">Your Requests</h3>
							<p className="text-sm md:text-base text-gray-600 mb-4">Track your outgoing swap requests</p>

							{outgoingRequests.length === 0 ? (
								<div className="text-center py-8 md:py-10 bg-white rounded-lg border">
									<p className="text-gray-500 text-sm md:text-base">No outgoing requests</p>
								</div>
							) : (
								<div className="bg-white rounded-lg border divide-y">
									{outgoingRequests.map((req) => {
										const statusStyles: Record<OutgoingSwapRequest['status'], string> = {
											PENDING: 'bg-yellow-50 text-yellow-800 border border-yellow-200',
											ACCEPTED: 'bg-green-50 text-green-700 border border-green-200',
											REJECTED: 'bg-red-50 text-red-700 border border-red-200',
										};
										const statusLabel: Record<OutgoingSwapRequest['status'], string> = {
											PENDING: 'Pending',
											ACCEPTED: 'Accepted',
											REJECTED: 'Rejected',
										};

										return (
											<div 
												key={req.id} 
												className="px-3 md:px-4 py-3 md:py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 cursor-pointer hover:bg-gray-50 transition-colors"
												onClick={() => setSelectedOutgoingRequest(req)}
											>
												<div className="flex items-center gap-2 md:gap-3">
													<div className="w-10 h-10 md:w-11 md:h-11 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xs md:text-sm flex-shrink-0">
														{req.recipientAvatar}
													</div>
													<div>
														<div className="flex items-center gap-2">
															<span className="font-semibold text-xs md:text-sm">{req.recipientName}</span>
															<span className="text-gray-400 text-xs">• {req.timestamp}</span>
														</div>
														<p className="text-xs text-gray-500">you requested a swap</p>
													</div>
												</div>
												<div className="flex items-center justify-between sm:justify-end gap-2 md:gap-4 text-xs md:text-sm text-gray-600">
													<div className="flex items-center gap-2 flex-1 sm:flex-initial">
														<span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[req.status]}`}>
															{req.status === 'ACCEPTED' && <Check className="inline w-3 h-3 md:w-3.5 md:h-3.5 mr-1" />}
															{statusLabel[req.status]}
														</span>
														{req.status === 'PENDING' && (
															<button
																onClick={(e) => {
																	e.stopPropagation();
																	handleCancelRequest(req.id);
																}}
																className="text-red-600 hover:text-red-700 text-xs font-medium"
															>
																Cancel
															</button>
														)}
													</div>
												</div>
											</div>
										);
									})}
								</div>
							)}
						</section>
					</div>

					{/* Detail Modal for Incoming */}
					{selectedRequest && (
						<div
							className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
							onClick={() => setSelectedRequest(null)}
						>
							<div
								className="bg-white rounded-lg max-w-md w-full p-6"
								onClick={(e) => e.stopPropagation()}
							>
								<div className="flex items-center justify-between mb-6">
									<h2 className="text-lg font-bold">Swap Request</h2>
									<button
										onClick={() => setSelectedRequest(null)}
										className="text-gray-400 hover:text-gray-600"
									>
										<X className="w-6 h-6" />
									</button>
								</div>

								{/* Requester */}
								<div className="flex items-center gap-3 mb-6">
									<div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
										{selectedRequest.requesterAvatar}
									</div>
									<div>
										<p className="font-semibold">{selectedRequest.requesterName}</p>
										<p className="text-sm text-gray-500">wants to swap with you</p>
									</div>
								</div>

								{/* Swap Details */}
								<div className="space-y-4 mb-6">
									{/* Their Event */}
									<div className="bg-purple-50 rounded-lg p-4">
										<div className="flex items-center gap-2 mb-2">
											<ArrowLeftRight className="w-4 h-4 text-purple-600" />
											<span className="text-xs font-semibold text-purple-900">They offer</span>
										</div>
										<h4 className="font-semibold mb-2">{selectedRequest.theirEvent.title}</h4>
										<div className="flex items-center gap-3 text-sm text-gray-600">
											<div className="flex items-center gap-1">
												<Calendar className="w-4 h-4" />
												<span>{selectedRequest.theirEvent.date}</span>
											</div>
											<div className="flex items-center gap-1">
												<Clock className="w-4 h-4" />
												<span>{selectedRequest.theirEvent.time}</span>
											</div>
										</div>
									</div>

									{/* Your Event */}
									<div className="bg-green-50 rounded-lg p-4">
										<div className="flex items-center gap-2 mb-2">
											<ArrowLeftRight className="w-4 h-4 text-green-600" />
											<span className="text-xs font-semibold text-green-900">Your event</span>
										</div>
										<h4 className="font-semibold mb-2">{selectedRequest.yourEvent.title}</h4>
										<div className="flex items-center gap-3 text-sm text-gray-600">
											<div className="flex items-center gap-1">
												<Calendar className="w-4 h-4" />
												<span>{selectedRequest.yourEvent.date}</span>
											</div>
											<div className="flex items-center gap-1">
												<Clock className="w-4 h-4" />
												<span>{selectedRequest.yourEvent.time}</span>
											</div>
										</div>
									</div>
								</div>

								{/* Actions */}
								<div className="flex gap-3">
									<button
										onClick={() => handleAccept(selectedRequest.id)}
										className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 rounded-lg"
									>
										Accept
									</button>
									<button
										onClick={() => handleReject(selectedRequest.id)}
										className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2.5 rounded-lg"
									>
										Reject
									</button>
								</div>
							</div>
						</div>
					)}

					{/* Detail Modal for Outgoing Requests */}
					{selectedOutgoingRequest && (
						<div
							className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
							onClick={() => setSelectedOutgoingRequest(null)}
						>
							<div
								className="bg-white rounded-lg max-w-md w-full p-6"
								onClick={(e) => e.stopPropagation()}
							>
								<div className="flex items-center justify-between mb-6">
									<h2 className="text-lg font-bold">Swap Request Details</h2>
									<button
										onClick={() => setSelectedOutgoingRequest(null)}
										className="text-gray-400 hover:text-gray-600"
									>
										<X className="w-6 h-6" />
									</button>
								</div>

								{/* Recipient */}
								<div className="flex items-center gap-3 mb-6">
									<div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
										{selectedOutgoingRequest.recipientAvatar}
									</div>
									<div>
										<p className="font-semibold">{selectedOutgoingRequest.recipientName}</p>
										<p className="text-sm text-gray-500">
											{selectedOutgoingRequest.status === 'PENDING' && 'Awaiting response'}
											{selectedOutgoingRequest.status === 'ACCEPTED' && 'Accepted your request'}
											{selectedOutgoingRequest.status === 'REJECTED' && 'Declined your request'}
										</p>
									</div>
								</div>

								{/* Status Badge */}
								<div className="mb-6 flex justify-center">
									<span className={`px-4 py-2 rounded-full text-sm font-medium ${
										selectedOutgoingRequest.status === 'PENDING' 
											? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
											: selectedOutgoingRequest.status === 'ACCEPTED'
											? 'bg-green-100 text-green-800 border border-green-300'
											: 'bg-red-100 text-red-800 border border-red-300'
									}`}>
										{selectedOutgoingRequest.status === 'PENDING' && '⏳ Pending'}
										{selectedOutgoingRequest.status === 'ACCEPTED' && '✓ Accepted'}
										{selectedOutgoingRequest.status === 'REJECTED' && '✗ Rejected'}
									</span>
								</div>

								{/* Swap Details */}
								<div className="space-y-4 mb-6">
									{/* Your Offer */}
									<div className="bg-blue-50 rounded-lg p-4">
										<div className="flex items-center gap-2 mb-2">
											<ArrowLeftRight className="w-4 h-4 text-blue-600" />
											<span className="text-xs font-semibold text-blue-900">You offered</span>
										</div>
										<h4 className="font-semibold mb-2">{selectedOutgoingRequest.yourOffer.title}</h4>
										<div className="flex items-center gap-3 text-sm text-gray-600">
											<div className="flex items-center gap-1">
												<Calendar className="w-4 h-4" />
												<span>{selectedOutgoingRequest.yourOffer.date}</span>
											</div>
											<div className="flex items-center gap-1">
												<Clock className="w-4 h-4" />
												<span>{selectedOutgoingRequest.yourOffer.time}</span>
											</div>
										</div>
									</div>

									{/* Their Event */}
									<div className="bg-purple-50 rounded-lg p-4">
										<div className="flex items-center gap-2 mb-2">
											<ArrowLeftRight className="w-4 h-4 text-purple-600" />
											<span className="text-xs font-semibold text-purple-900">In exchange for</span>
										</div>
										<h4 className="font-semibold mb-2">{selectedOutgoingRequest.theirEvent.title}</h4>
										<div className="flex items-center gap-3 text-sm text-gray-600">
											<div className="flex items-center gap-1">
												<Calendar className="w-4 h-4" />
												<span>{selectedOutgoingRequest.theirEvent.date}</span>
											</div>
											<div className="flex items-center gap-1">
												<Clock className="w-4 h-4" />
												<span>{selectedOutgoingRequest.theirEvent.time}</span>
											</div>
										</div>
									</div>
								</div>

								{/* Actions */}
								<div className="flex gap-3">
									{selectedOutgoingRequest.status === 'PENDING' ? (
										<>
											<button
												onClick={() => setSelectedOutgoingRequest(null)}
												className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2.5 rounded-lg"
											>
												Close
											</button>
											<button
												onClick={() => {
													handleCancelRequest(selectedOutgoingRequest.id);
													setSelectedOutgoingRequest(null);
												}}
												className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-lg"
											>
												Cancel Request
											</button>
										</>
									) : (
										<button
											onClick={() => setSelectedOutgoingRequest(null)}
											className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 rounded-lg"
										>
											Close
										</button>
									)}
								</div>
							</div>
						</div>
					)}

					{/* Confirmation Modal */}
					{confirmAction && (
						<div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
							<div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl">
								<div className="text-center mb-6">
									<div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
										confirmAction.type === 'accept' ? 'bg-purple-100' : 'bg-gray-100'
									}`}>
										{confirmAction.type === 'accept' ? (
											<Check className="w-8 h-8 text-purple-600" />
										) : (
											<X className="w-8 h-8 text-gray-600" />
										)}
									</div>
									<h3 className="text-lg font-bold mb-2">
										{confirmAction.type === 'accept' ? 'Accept Swap Request?' : 'Reject Swap Request?'}
									</h3>
									<p className="text-sm text-gray-500">
										{confirmAction.type === 'accept' 
											? 'This will exchange your events with the requester.' 
											: 'This will decline the swap request.'}
									</p>
								</div>
								<div className="flex gap-3">
									<button
										onClick={() => setConfirmAction(null)}
										className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2.5 rounded-lg transition-colors"
									>
										Cancel
									</button>
									<button
										onClick={confirmAction.type === 'accept' ? confirmAccept : confirmReject}
										className={`flex-1 font-semibold py-2.5 rounded-lg transition-colors ${
											confirmAction.type === 'accept'
												? 'bg-purple-600 hover:bg-purple-700 text-white'
												: 'bg-gray-600 hover:bg-gray-700 text-white'
										}`}
									>
										Yes, Sure
									</button>
								</div>
							</div>
						</div>
					)}
				</main>
			</div>
      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-50 shadow-lg">
        <div className="flex justify-around items-center">
          <Link to="/dashboard" className="flex flex-col items-center gap-1 text-gray-600 transition-all hover:scale-105 hover:text-purple-600">
            <Calendar size={20} />
            <span className="text-xs">Dashboard</span>
          </Link>
          <Link to="/marketplace" className="flex flex-col items-center gap-1 text-gray-600 transition-all hover:scale-105 hover:text-purple-600">
            <List size={20} />
            <span className="text-xs">Marketplace</span>
          </Link>
          <Link to="/requests" className="flex flex-col items-center gap-1 text-purple-600 transition-all hover:scale-105">
            <Bell size={20} />
            <span className="text-xs">Requests</span>
          </Link>
        </div>
      </nav>
		</div>
	);
}