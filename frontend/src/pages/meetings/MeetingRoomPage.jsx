import React, { useState, useEffect, useRef } from 'react';
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  Monitor,
  MessageSquare,
  Users,
  PhoneOff,
  Plus,
  Lock,
  Unlock,
  Shield,
  Send,
  RefreshCw,
  Clock,
  Calendar,
  Sparkles,
} from 'lucide-react';
import axios from 'axios';
import { useLanguage } from '../../i18n/LanguageContext';

const MeetingRoomPage = () => {
  const { t } = useLanguage();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active Call State
  const [activeMeeting, setActiveMeeting] = useState(null);
  const [isInCall, setIsInCall] = useState(false);

  // WebRTC Media Controls
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [activeSidebar, setActiveSidebar] = useState('chat'); // chat, participants

  // Streams
  const localVideoRef = useRef(null);
  const mediaStreamRef = useRef(null);

  // In-Meeting Chat State
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');

  // Schedule Modal State
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    title: '',
    description: '',
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTime: '10:00',
    durationMinutes: 45,
    meetingType: 'CLASS',
  });

  useEffect(() => {
    fetchMeetings();
    return () => {
      stopMediaTracks();
    };
  }, []);

  const fetchMeetings = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/meetings/meetings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.success) {
        setMeetings(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching meetings:', err);
      const rawMsg = err.response?.data?.message || err.message;
      if (err.response?.status === 401 || (rawMsg && (rawMsg.includes('token') || rawMsg.includes('authorized')))) {
        setError('Please sign in to view scheduled online meetings.');
      } else {
        setError(rawMsg || 'Failed to load scheduled meetings. Please refresh.');
      }
    } finally {
      setLoading(false);
    }
  };

  const stopMediaTracks = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
  };

  const handleStartOrJoinCall = async (meeting) => {
    try {
      const res = await axios.get(`/api/meetings/meetings/join/${meeting.roomCode}`);
      if (res.data?.success) {
        setActiveMeeting(meeting);
        setIsInCall(true);
        setChatMessages(meeting.chatMessages || []);

        // Request local camera and microphone stream
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          mediaStreamRef.current = stream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        } catch (mediaErr) {
          console.warn('Camera/Mic access not granted or not available:', mediaErr);
        }

        // Host updates meeting status to LIVE
        if (meeting.status === 'SCHEDULED') {
          await axios.put(`/api/meetings/meetings/${meeting._id}/start`);
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to join meeting room');
    }
  };

  const handleLeaveCall = async () => {
    stopMediaTracks();
    if (activeMeeting) {
      try {
        await axios.put(`/api/meetings/meetings/${activeMeeting._id}/end`);
      } catch (err) {
        console.error('Error ending meeting:', err);
      }
    }
    setIsInCall(false);
    setActiveMeeting(null);
    fetchMeetings();
  };

  const toggleMic = () => {
    if (mediaStreamRef.current) {
      const audioTrack = mediaStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isMicOn;
        setIsMicOn(!isMicOn);
      }
    } else {
      setIsMicOn(!isMicOn);
    }
  };

  const toggleCam = () => {
    if (mediaStreamRef.current) {
      const videoTrack = mediaStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isCamOn;
        setIsCamOn(!isCamOn);
      }
    } else {
      setIsCamOn(!isCamOn);
    }
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
        setIsScreenSharing(true);

        screenStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          if (mediaStreamRef.current && localVideoRef.current) {
            localVideoRef.current.srcObject = mediaStreamRef.current;
          }
        };
      } catch (err) {
        console.warn('Screen share cancelled or failed:', err);
      }
    } else {
      setIsScreenSharing(false);
      if (mediaStreamRef.current && localVideoRef.current) {
        localVideoRef.current.srcObject = mediaStreamRef.current;
      }
    }
  };

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeMeeting) return;

    try {
      const res = await axios.post(`/api/meetings/meetings/${activeMeeting._id}/chat`, {
        message: chatInput.trim(),
      });
      if (res.data?.success) {
        setChatMessages([...chatMessages, res.data.data]);
        setChatInput('');
      }
    } catch (err) {
      console.error('Failed to send chat message:', err);
    }
  };

  const handleCreateMeeting = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/meetings/meetings', scheduleForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.success) {
        setShowScheduleModal(false);
        setScheduleForm({
          title: '',
          description: '',
          scheduledDate: new Date().toISOString().split('T')[0],
          scheduledTime: '10:00',
          durationMinutes: 45,
          meetingType: 'CLASS',
        });
        fetchMeetings();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to schedule meeting');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* If currently in an active meeting call */}
      {isInCall && activeMeeting ? (
        <div className="bg-gray-950 text-white rounded-3xl p-6 min-h-[600px] flex flex-col justify-between shadow-2xl relative overflow-hidden">
          {/* Top Bar */}
          <div className="flex items-center justify-between z-10 bg-gray-900/80 backdrop-blur-md px-6 py-3 rounded-2xl border border-gray-800">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></span>
              <div>
                <h2 className="font-bold text-white text-base">{activeMeeting.title}</h2>
                <span className="text-xs text-emerald-400 font-mono">Room ID: {activeMeeting.roomCode}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full font-semibold">
                WebRTC Encrypted Stream
              </span>
            </div>
          </div>

          {/* Main Video & Sidebar Section */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 my-4 flex-1">
            {/* Video Stage */}
            <div className="lg:col-span-3 bg-gray-900 rounded-2xl relative flex items-center justify-center border border-gray-800 overflow-hidden min-h-[420px]">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover rounded-2xl ${!isCamOn ? 'hidden' : ''}`}
              />
              {!isCamOn && (
                <div className="text-center space-y-2">
                  <div className="w-20 h-20 bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                    {activeMeeting.organizerName?.charAt(0) || 'U'}
                  </div>
                  <p className="text-sm font-medium text-gray-400">Camera is Turned Off</p>
                </div>
              )}

              {/* Participant badge overlay */}
              <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-semibold text-white flex items-center gap-2 border border-white/10">
                <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                You ({activeMeeting.organizerName || 'Instructor'})
              </div>
            </div>

            {/* Sidebar (Chat / Participants) */}
            <div className="bg-gray-900/90 rounded-2xl border border-gray-800 flex flex-col justify-between overflow-hidden">
              {/* Tabs */}
              <div className="flex border-b border-gray-800 bg-gray-950/50 p-1">
                <button
                  onClick={() => setActiveSidebar('chat')}
                  className={`flex-1 py-2 text-xs font-semibold rounded-xl transition ${
                    activeSidebar === 'chat' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  In-Meeting Chat
                </button>
                <button
                  onClick={() => setActiveSidebar('participants')}
                  className={`flex-1 py-2 text-xs font-semibold rounded-xl transition ${
                    activeSidebar === 'participants' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  Participants
                </button>
              </div>

              {/* Chat View */}
              {activeSidebar === 'chat' ? (
                <div className="flex-1 p-4 flex flex-col justify-between space-y-3 min-h-[300px]">
                  <div className="overflow-y-auto space-y-3 max-h-[320px] text-xs">
                    {chatMessages.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No messages yet. Send a message to chat.</p>
                    ) : (
                      chatMessages.map((msg, idx) => (
                        <div key={idx} className="bg-gray-800/80 p-2.5 rounded-xl space-y-0.5">
                          <span className="font-bold text-emerald-400 block">{msg.senderName}</span>
                          <p className="text-gray-200">{msg.message}</p>
                        </div>
                      ))
                    )}
                  </div>

                  <form onSubmit={handleSendChat} className="flex gap-2 pt-2 border-t border-gray-800">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 bg-gray-800 text-white px-3 py-2 rounded-xl text-xs border border-gray-700 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="submit"
                      className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              ) : (
                /* Participants View */
                <div className="p-4 space-y-3 text-xs">
                  <div className="font-semibold text-gray-400 mb-2">Active Participants</div>
                  <div className="flex items-center justify-between bg-gray-800/60 p-2.5 rounded-xl">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-emerald-600 rounded-full flex items-center justify-center font-bold text-white text-xs">
                        Host
                      </div>
                      <span className="text-gray-200 font-medium">{activeMeeting.organizerName} (Host)</span>
                    </div>
                    <span className="text-emerald-400 font-medium">Online</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Call Controls Bar */}
          <div className="flex items-center justify-center gap-4 bg-gray-900/80 backdrop-blur-md px-6 py-4 rounded-2xl border border-gray-800 z-10">
            <button
              onClick={toggleMic}
              className={`p-3.5 rounded-2xl transition ${
                isMicOn ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-rose-600 text-white hover:bg-rose-500'
              }`}
            >
              {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>

            <button
              onClick={toggleCam}
              className={`p-3.5 rounded-2xl transition ${
                isCamOn ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-rose-600 text-white hover:bg-rose-500'
              }`}
            >
              {isCamOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>

            <button
              onClick={toggleScreenShare}
              className={`p-3.5 rounded-2xl transition ${
                isScreenSharing ? 'bg-sky-600 text-white' : 'bg-gray-800 text-white hover:bg-gray-700'
              }`}
            >
              <Monitor className="w-5 h-5" />
            </button>

            <button
              onClick={handleLeaveCall}
              className="px-6 py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-2xl transition flex items-center gap-2 shadow-lg shadow-rose-600/30"
            >
              <PhoneOff className="w-5 h-5" />
              Leave Meeting
            </button>
          </div>
        </div>
      ) : (
        /* Standard Meetings Dashboard View */
        <>
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-emerald-100">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Video className="w-7 h-7 text-emerald-600" />
                In-App Online Meetings & Virtual Classes
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Real-time WebRTC audio/video meetings, screen sharing, and interactive classrooms
              </p>
            </div>
            <button
              onClick={() => setShowScheduleModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium text-sm transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Schedule Online Class / Meeting
            </button>
          </div>

          {/* Meetings List */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm min-h-[400px]">
            {loading ? (
              <div className="flex items-center justify-center py-16 text-gray-500 gap-2">
                <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
                <span>Loading online meeting rooms...</span>
              </div>
            ) : error ? (
              <div className="p-4 bg-red-50 text-red-600 rounded-xl text-center text-sm">{error}</div>
            ) : meetings.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Video className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                <p className="text-base font-semibold text-gray-600">No scheduled meetings or online classes</p>
                <p className="text-xs text-gray-400 mt-1">Click "Schedule Online Class" to create an in-app meeting room</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {meetings.map((mtg) => (
                  <div
                    key={mtg._id}
                    className="p-5 border border-gray-100 rounded-2xl bg-gray-50/50 hover:bg-white hover:shadow-md transition space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span
                          className={`px-2.5 py-0.5 text-xs rounded-full font-bold ${
                            mtg.status === 'LIVE'
                              ? 'bg-rose-100 text-rose-700 animate-pulse'
                              : mtg.status === 'ENDED'
                              ? 'bg-gray-100 text-gray-600'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {mtg.status}
                        </span>
                        <span className="text-xs font-mono bg-white px-2 py-0.5 rounded border text-gray-600">
                          {mtg.roomCode}
                        </span>
                      </div>

                      <h3 className="font-bold text-gray-900 text-lg">{mtg.title}</h3>
                      {mtg.description && <p className="text-xs text-gray-600 line-clamp-2">{mtg.description}</p>}

                      <div className="space-y-1 pt-2 text-xs text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-emerald-600" />
                          <span>{mtg.scheduledDate}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-sky-600" />
                          <span>
                            {mtg.scheduledTime} ({mtg.durationMinutes} mins)
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-indigo-600" />
                          <span>Host: {mtg.organizerName}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleStartOrJoinCall(mtg)}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2 shadow-sm mt-3"
                    >
                      <Video className="w-4 h-4" />
                      {mtg.status === 'LIVE' ? 'Join Live Room' : 'Launch Meeting Room'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* SCHEDULE MEETING MODAL */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">Schedule Online Meeting / Class</h3>
            <form onSubmit={handleCreateMeeting} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-700">Meeting Title *</label>
                <input
                  type="text"
                  required
                  value={scheduleForm.title}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, title: e.target.value })}
                  placeholder="e.g. Grade 10 Mathematics Revision Class"
                  className="w-full mt-1 p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700">Scheduled Date *</label>
                  <input
                    type="date"
                    required
                    value={scheduleForm.scheduledDate}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledDate: e.target.value })}
                    className="w-full mt-1 p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700">Scheduled Time *</label>
                  <input
                    type="time"
                    required
                    value={scheduleForm.scheduledTime}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledTime: e.target.value })}
                    className="w-full mt-1 p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700">Duration (Mins)</label>
                  <input
                    type="number"
                    min="15"
                    max="180"
                    value={scheduleForm.durationMinutes}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, durationMinutes: Number(e.target.value) })}
                    className="w-full mt-1 p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700">Audience / Type</label>
                  <select
                    value={scheduleForm.meetingType}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, meetingType: e.target.value })}
                    className="w-full mt-1 p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="CLASS">Classroom Students</option>
                    <option value="TEACHERS">Teachers Only</option>
                    <option value="STAFF">Staff Only</option>
                    <option value="ALL_SCHOOL">All School Assembly</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700">Description / Agenda</label>
                <textarea
                  rows="3"
                  value={scheduleForm.description}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, description: e.target.value })}
                  placeholder="Topic covered or meeting agenda..."
                  className="w-full mt-1 p-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 border rounded-xl text-sm font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700"
                >
                  Schedule Meeting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingRoomPage;
