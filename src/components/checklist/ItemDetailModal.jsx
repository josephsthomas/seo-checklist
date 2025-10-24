import React, { useState, useEffect } from 'react';
import { X, User, Calendar, Clock, MessageSquare, Activity, Check } from 'lucide-react';
import { useComments } from '../../hooks/useComments';
import { useAssignments } from '../../hooks/useAssignments';
import { useActivityLog } from '../../hooks/useActivityLog';
import { useAuth } from '../../contexts/AuthContext';
import { TASK_STATUS, TASK_STATUS_LABELS } from '../../utils/roles';
import CommentThread from './CommentThread';
import { format } from 'date-fns';

export default function ItemDetailModal({ item, projectId, isOpen, onClose, onToggleComplete, isCompleted }) {
  const [activeTab, setActiveTab] = useState('details');
  const { currentUser } = useAuth();
  const { comments, loading: commentsLoading, addComment } = useComments(projectId, item?.id);
  const { assignments, assignTask, updateTaskStatus } = useAssignments(projectId);
  const { activities } = useActivityLog(projectId);

  const [assignmentData, setAssignmentData] = useState({
    assignedTo: [],
    dueDate: '',
    estimatedHours: '',
    status: TASK_STATUS.NOT_STARTED
  });

  const assignment = assignments[item?.id];

  useEffect(() => {
    if (assignment) {
      setAssignmentData({
        assignedTo: assignment.assignedTo || [],
        dueDate: assignment.dueDate ? format(assignment.dueDate.toDate(), 'yyyy-MM-dd') : '',
        estimatedHours: assignment.estimatedHours || '',
        status: assignment.status || TASK_STATUS.NOT_STARTED
      });
    }
  }, [assignment]);

  if (!isOpen || !item) return null;

  const handleAssign = async () => {
    if (assignmentData.assignedTo.length === 0) return;

    await assignTask(
      item.id,
      assignmentData.assignedTo,
      assignmentData.dueDate,
      assignmentData.estimatedHours
    );
  };

  const handleStatusChange = async (newStatus) => {
    await updateTaskStatus(item.id, newStatus);
    setAssignmentData(prev => ({ ...prev, status: newStatus }));
  };

  const itemActivities = activities.filter(a => a.details?.itemId === item.id);

  const priorityColors = {
    'CRITICAL': 'bg-red-100 text-red-800',
    'HIGH': 'bg-orange-100 text-orange-800',
    'MEDIUM': 'bg-yellow-100 text-yellow-800',
    'LOW': 'bg-blue-100 text-blue-800'
  };

  const riskColors = {
    'BLOCKER': 'bg-red-600 text-white',
    'HIGH RISK': 'bg-red-100 text-red-800',
    'MEDIUM': 'bg-yellow-100 text-yellow-800',
    'LOW': 'bg-green-100 text-green-800'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-gray-500">Item #{item.id}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${priorityColors[item.priority]}`}>
                    {item.priority}
                  </span>
                  {item.riskLevel && (
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${riskColors[item.riskLevel]}`}>
                      {item.riskLevel}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {item.item}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="ml-4 text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b">
            <div className="flex px-6">
              {['details', 'comments', 'activity'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {tab === 'comments' && comments.length > 0 && (
                    <span className="ml-2 px-2 py-0.5 rounded-full bg-gray-200 text-xs">
                      {comments.length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6 max-h-[600px] overflow-y-auto">
            {activeTab === 'details' && (
              <div className="space-y-6">
                {/* Item Details */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Item Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Phase:</span>
                      <span className="ml-2 font-medium">{item.phase}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Owner:</span>
                      <span className="ml-2 font-medium">{item.owner}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Category:</span>
                      <span className="ml-2 font-medium">{item.category}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Effort:</span>
                      <span className="ml-2 font-medium">{item.effortLevel}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-500">Deliverable Type:</span>
                      <span className="ml-2 font-medium">{item.deliverableType}</span>
                    </div>
                  </div>
                </div>

                {/* Assignment Section */}
                <div className="border-t pt-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Assignment</h4>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Assigned To
                      </label>
                      <input
                        type="text"
                        placeholder="Enter user IDs (comma-separated)"
                        value={assignmentData.assignedTo.join(', ')}
                        onChange={(e) => setAssignmentData(prev => ({
                          ...prev,
                          assignedTo: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                        }))}
                        className="input"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Due Date
                        </label>
                        <input
                          type="date"
                          value={assignmentData.dueDate}
                          onChange={(e) => setAssignmentData(prev => ({
                            ...prev,
                            dueDate: e.target.value
                          }))}
                          className="input"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Estimated Hours
                        </label>
                        <input
                          type="number"
                          placeholder="e.g., 8"
                          value={assignmentData.estimatedHours}
                          onChange={(e) => setAssignmentData(prev => ({
                            ...prev,
                            estimatedHours: e.target.value
                          }))}
                          className="input"
                          min="0"
                          step="0.5"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <div className="flex gap-2">
                        {Object.entries(TASK_STATUS_LABELS).map(([value, label]) => (
                          <button
                            key={value}
                            onClick={() => handleStatusChange(value)}
                            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                              assignmentData.status === value
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={handleAssign}
                      className="btn btn-primary w-full"
                      disabled={assignmentData.assignedTo.length === 0}
                    >
                      Save Assignment
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'comments' && (
              <CommentThread
                comments={comments}
                loading={commentsLoading}
                onAddComment={addComment}
                projectId={projectId}
                itemId={item.id}
              />
            )}

            {activeTab === 'activity' && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Recent Activity</h4>
                {itemActivities.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">
                    No activity yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {itemActivities.map((activity, index) => (
                      <div key={index} className="flex items-start gap-3 text-sm">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Activity className="w-4 h-4 text-primary-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-900">
                            <span className="font-medium">{activity.userName}</span>{' '}
                            {activity.action.replace('_', ' ')}
                          </p>
                          <p className="text-gray-500 text-xs mt-0.5">
                            {activity.timestamp?.toDate ? format(activity.timestamp.toDate(), 'PPp') : 'Just now'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex justify-between">
            <button
              onClick={() => onToggleComplete(item.id)}
              className={`btn ${isCompleted ? 'btn-secondary' : 'btn-primary'} flex items-center gap-2`}
            >
              <Check className="w-4 h-4" />
              {isCompleted ? 'Mark Incomplete' : 'Mark Complete'}
            </button>
            <button onClick={onClose} className="btn btn-secondary">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
