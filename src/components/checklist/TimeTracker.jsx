/**
 * Time Tracker Component
 * Embedded time tracking within item detail modal
 * Phase 9 - Batch 5
 */

import React, { useState, useEffect } from 'react';
import { Play, Square, Clock, Plus, Trash2 } from 'lucide-react';
import { useTimeTracking } from '../../hooks/useTimeTracking';
import { format } from 'date-fns';

export default function TimeTracker({ projectId, itemId, estimatedHours }) {
  const {
    timeEntries,
    activeTimer,
    loading,
    startTimer,
    stopTimer,
    addManualEntry,
    deleteEntry,
    getTotalMinutes,
    formatDuration
  } = useTimeTracking(projectId, itemId);

  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualMinutes, setManualMinutes] = useState('');
  const [manualNotes, setManualNotes] = useState('');
  const [timerNotes, setTimerNotes] = useState('');
  const [elapsedTime, setElapsedTime] = useState('00:00:00');

  // Update elapsed time for active timer
  useEffect(() => {
    if (!activeTimer) {
      setElapsedTime('00:00:00');
      return;
    }

    const updateElapsed = () => {
      const now = new Date();
      const diff = now - activeTimer.startTime;
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      setElapsedTime(
        `${hours.toString().padStart(2, '0')}:${minutes
          .toString()
          .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);

    return () => clearInterval(interval);
  }, [activeTimer]);

  const handleStartTimer = async () => {
    await startTimer(itemId, timerNotes);
    setTimerNotes('');
  };

  const handleAddManualEntry = async () => {
    const minutes = parseInt(manualMinutes);
    if (!minutes || minutes <= 0) {
      return;
    }

    await addManualEntry(itemId, minutes, manualNotes);
    setManualMinutes('');
    setManualNotes('');
    setShowManualEntry(false);
  };

  const totalMinutes = getTotalMinutes(itemId);
  const totalHours = totalMinutes / 60;
  const estimatedMinutes = estimatedHours ? estimatedHours * 60 : null;
  const variance = estimatedMinutes ? totalMinutes - estimatedMinutes : null;
  const isOverBudget = variance && variance > 0;

  if (loading) {
    return <div className="text-sm text-gray-500">Loading time tracking...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Timer Controls */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-900">Time Tracker</span>
          </div>
          {activeTimer && (
            <div className="text-2xl font-mono font-bold text-blue-600">
              {elapsedTime}
            </div>
          )}
        </div>

        {activeTimer ? (
          <div className="space-y-3">
            <div className="text-sm text-gray-600">
              Started: {format(activeTimer.startTime, 'h:mm a')}
            </div>
            <button
              onClick={() => stopTimer()}
              className="w-full btn btn-primary flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700"
            >
              <Square className="w-4 h-4" />
              Stop Timer
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <input
              type="text"
              value={timerNotes}
              onChange={(e) => setTimerNotes(e.target.value)}
              placeholder="What are you working on? (optional)"
              className="input w-full text-sm"
            />
            <button
              onClick={handleStartTimer}
              className="w-full btn btn-primary flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" />
              Start Timer
            </button>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
        <div>
          <div className="text-xs text-blue-600 mb-1">Total Logged</div>
          <div className="text-lg font-semibold text-blue-900">
            {formatDuration(totalMinutes)} ({totalHours.toFixed(1)}h)
          </div>
        </div>
        {estimatedHours && (
          <div>
            <div className="text-xs text-blue-600 mb-1">vs Estimate</div>
            <div className={`text-lg font-semibold ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
              {isOverBudget ? '+' : ''}{variance ? formatDuration(Math.abs(variance)) : '0m'}
            </div>
          </div>
        )}
      </div>

      {/* Manual Entry */}
      <div>
        {showManualEntry ? (
          <div className="p-4 border border-gray-200 rounded-lg space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minutes
              </label>
              <input
                type="number"
                value={manualMinutes}
                onChange={(e) => setManualMinutes(e.target.value)}
                placeholder="e.g., 30"
                className="input w-full"
                min="1"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (optional)
              </label>
              <input
                type="text"
                value={manualNotes}
                onChange={(e) => setManualNotes(e.target.value)}
                placeholder="What did you work on?"
                className="input w-full"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddManualEntry}
                className="btn btn-primary flex-1"
              >
                Add Entry
              </button>
              <button
                onClick={() => {
                  setShowManualEntry(false);
                  setManualMinutes('');
                  setManualNotes('');
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowManualEntry(true)}
            className="w-full btn btn-secondary flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Manual Entry
          </button>
        )}
      </div>

      {/* Time Entries List */}
      {timeEntries.length > 0 && (
        <div>
          <h5 className="text-sm font-medium text-gray-900 mb-2">Time Log</h5>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {timeEntries
              .filter(e => !e.isActive)
              .sort((a, b) => b.startTime - a.startTime)
              .map(entry => (
                <div
                  key={entry.id}
                  className="p-3 bg-gray-50 rounded text-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">
                          {formatDuration(entry.minutes)}
                        </span>
                        {entry.isManual && (
                          <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded">
                            Manual
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-600">
                        {format(entry.startTime, 'MMM d, h:mm a')}
                        {entry.notes && ` - ${entry.notes}`}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteEntry(entry.id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                      title="Delete entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
