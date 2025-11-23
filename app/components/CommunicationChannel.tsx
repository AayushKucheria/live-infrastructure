'use client';

import { useState, useEffect } from 'react';
import { StoredCommunicationChannel } from '../lib/storage';
import { getLabById } from '../lib/mockData';
import { saveCommunicationChannel, getCommunicationChannelsByAbnormalityBubble } from '../lib/storage';

interface CommunicationChannelProps {
  abnormalityBubbleId: string;
  currentLabId: string;
  otherLabId: string;
}

export default function CommunicationChannel({ abnormalityBubbleId, currentLabId, otherLabId }: CommunicationChannelProps) {
  const [channels, setChannels] = useState<StoredCommunicationChannel[]>([]);
  const [messageType, setMessageType] = useState<'request' | 'send' | 'conditional'>('request');
  const [messageContent, setMessageContent] = useState('');
  const [conditions, setConditions] = useState('');

  useEffect(() => {
    const existing = getCommunicationChannelsByAbnormalityBubble(abnormalityBubbleId);
    setChannels(existing);
  }, [abnormalityBubbleId]);

  const currentLab = getLabById(currentLabId);
  const otherLab = getLabById(otherLabId);

  const handleSendMessage = () => {
    if (!messageContent.trim()) return;

    // Find or create channel
    let channel = channels.find(c => 
      c.participants.includes(currentLabId) && c.participants.includes(otherLabId)
    );

    if (!channel) {
      channel = {
        id: `channel-${Date.now()}`,
        abnormalityBubbleId,
        participants: [currentLabId, otherLabId],
        messages: []
      };
    }

    const newMessage = {
      id: `msg-${Date.now()}`,
      fromLabId: currentLabId,
      type: messageType,
      content: messageContent,
      timestamp: new Date().toISOString(),
      ...(messageType === 'conditional' && conditions && { conditions })
    };

    channel.messages.push(newMessage);
    saveCommunicationChannel(channel);
    
    setChannels([...channels.filter(c => c.id !== channel!.id), channel]);
    setMessageContent('');
    setConditions('');
  };

  const getMessageTypeLabel = (type: string) => {
    switch (type) {
      case 'request': return 'Request Information';
      case 'send': return 'Send Information';
      case 'conditional': return 'Conditional Flow';
      default: return type;
    }
  };

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'request': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'send': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'conditional': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      default: return 'bg-zinc-100 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
          Communication Channel
        </h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Communicating with <span className="font-medium">{otherLab?.name}</span>
        </p>
      </div>

      {/* Message History */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-zinc-700 dark:text-zinc-300">Message History</h4>
        {channels.length === 0 || channels[0]?.messages.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400 italic">No messages yet. Start a conversation below.</p>
        ) : (
          <div className="space-y-3">
            {channels[0]?.messages.map((msg) => {
              const fromLab = getLabById(msg.fromLabId);
              const isFromCurrent = msg.fromLabId === currentLabId;
              
              return (
                <div
                  key={msg.id}
                  className={`p-4 rounded-lg ${
                    isFromCurrent
                      ? 'bg-blue-50 dark:bg-blue-900/20 ml-8'
                      : 'bg-zinc-100 dark:bg-zinc-800 mr-8'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                        {fromLab?.name || 'Unknown Lab'}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${getMessageTypeColor(msg.type)}`}>
                        {getMessageTypeLabel(msg.type)}
                      </span>
                    </div>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      {new Date(msg.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-2">{msg.content}</p>
                  {msg.conditions && (
                    <div className="mt-2 p-2 bg-purple-50 dark:bg-purple-900/30 rounded border-l-2 border-purple-500">
                      <p className="text-xs font-medium text-purple-800 dark:text-purple-400 mb-1">Conditions:</p>
                      <p className="text-xs text-purple-700 dark:text-purple-300">{msg.conditions}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Send Message Form */}
      <div className="border-t border-zinc-200 dark:border-zinc-700 pt-6">
        <h4 className="text-md font-medium text-zinc-700 dark:text-zinc-300 mb-4">Send Message</h4>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Message Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMessageType('request')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  messageType === 'request'
                    ? 'bg-blue-600 text-white'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                Request Info
              </button>
              <button
                type="button"
                onClick={() => setMessageType('send')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  messageType === 'send'
                    ? 'bg-green-600 text-white'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                Send Info
              </button>
              <button
                type="button"
                onClick={() => setMessageType('conditional')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  messageType === 'conditional'
                    ? 'bg-purple-600 text-white'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                Conditional
              </button>
            </div>
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
              {messageType === 'request' && 'Request specific information from the other lab'}
              {messageType === 'send' && 'Send information to the other lab'}
              {messageType === 'conditional' && 'Set up conditional information exchange (e.g., "I will share X if you share Y")'}
            </p>
          </div>

          {messageType === 'conditional' && (
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Conditions
              </label>
              <input
                type="text"
                value={conditions}
                onChange={(e) => setConditions(e.target.value)}
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., I will share genetic data if you share sample locations"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Message Content
            </label>
            <textarea
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={
                messageType === 'request'
                  ? 'What information would you like to request?'
                  : messageType === 'send'
                  ? 'What information would you like to share?'
                  : 'Describe the conditional information flow...'
              }
            />
          </div>

          <button
            onClick={handleSendMessage}
            disabled={!messageContent.trim()}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Send Message
          </button>
        </div>
      </div>
    </div>
  );
}

