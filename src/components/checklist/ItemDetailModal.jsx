import React, { useState, useEffect } from 'react';
import { X, User, Calendar, Clock, MessageSquare, Activity, Check, AlertCircle, CalendarClock, HelpCircle, Info } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useComments } from '../../hooks/useComments';
import { useAssignments } from '../../hooks/useAssignments';
import { useActivityLog } from '../../hooks/useActivityLog';
import { useAuth } from '../../contexts/AuthContext';
import { TASK_STATUS, TASK_STATUS_LABELS } from '../../utils/roles';
import CommentThread from './CommentThread';
import TimeTracker from './TimeTracker';
import FileUpload from './FileUpload';
import { format, parseISO } from 'date-fns';
import {
  formatDate,
  getRelativeDate,
  isOverdue,
  isDueSoon,
  getDueDateColor,
  getDueDateBadgeColor
} from '../../utils/dateHelpers';

// Help tooltips for form fields
const FIELD_HELP = {
  assignedTo: 'Enter team member email addresses or user IDs separated by commas. These users will receive notifications about this task.',
  startDate: 'When work should begin on this item. Leave blank if the team can start immediately.',
  dueDate: 'Target completion date for this item. Setting a due date helps track project timeline and triggers reminders.',
  estimatedHours: 'Expected time to complete this item. Used for workload planning and time tracking comparison.',
  notes: 'Internal notes visible to all team members. Use for special instructions, blockers, or context.',
  status: 'Current workflow state of this item. Use to track progress through your process.'
};

// Tooltip component
function Tooltip({ text, children }) {
  const [show, setShow] = useState(false);

  return (
    <span className="relative inline-block">
      <span
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="cursor-help"
      >
        {children}
      </span>
      {show && (
        <span className="absolute z-50 w-64 p-2 text-xs text-white bg-charcoal-800 rounded-lg shadow-lg -top-2 left-6 transform">
          {text}
          <span className="absolute w-2 h-2 bg-charcoal-800 transform rotate-45 -left-1 top-3" />
        </span>
      )}
    </span>
  );
}

export default function ItemDetailModal({ item, projectId, isOpen, onClose, onToggleComplete, isCompleted }) {
  const [activeTab, setActiveTab] = useState('details');
  const { currentUser } = useAuth();
  const { comments, loading: commentsLoading, addComment } = useComments(projectId, item?.id);
  const { assignments, assignTask, updateTaskStatus, updateTimeline } = useAssignments(projectId);
  const { activities } = useActivityLog(projectId);

  const [assignmentData, setAssignmentData] = useState({
    assignedTo: [],
    startDate: null,
    dueDate: null,
    completedDate: null,
    estimatedHours: '',
    notes: '',
    status: TASK_STATUS.NOT_STARTED
  });

  const assignment = assignments[item?.id];

  useEffect(() => {
    if (assignment) {
      setAssignmentData({
        assignedTo: assignment.assignedTo || [],
        startDate: assignment.startDate ? assignment.startDate.toDate() : null,
        dueDate: assignment.dueDate ? assignment.dueDate.toDate() : null,
        completedDate: assignment.completedDate ? assignment.completedDate.toDate() : null,
        estimatedHours: assignment.estimatedHours || '',
        notes: assignment.notes || '',
        status: assignment.status || TASK_STATUS.NOT_STARTED
      });
    }
  }, [assignment]);

  // Keyboard navigation: Escape key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen || !item) return null;

  const handleAssign = async () => {
    if (assignmentData.assignedTo.length === 0) return;

    await assignTask(
      item.id,
      assignmentData.assignedTo,
      assignmentData.dueDate,
      assignmentData.estimatedHours,
      assignmentData.startDate
    );

    // Update additional timeline data
    if (assignmentData.notes) {
      await updateTimeline(item.id, {
        notes: assignmentData.notes
      });
    }
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
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-charcoal-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-charcoal-500">Item #{item.id}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${priorityColors[item.priority]}`}>
                    {item.priority}
                  </span>
                  {item.riskLevel && (
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${riskColors[item.riskLevel]}`}>
                      {item.riskLevel}
                    </span>
                  )}
                </div>
                <h3 id="modal-title" className="text-lg font-semibold text-charcoal-900">
                  {item.item}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="ml-4 text-charcoal-400 hover:text-charcoal-500"
                aria-label="Close modal"
              >
                <X className="w-6 h-6" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b">
            <div className="flex px-6" role="tablist" aria-label="Item details sections">
              {['details', 'time', 'files', 'comments', 'activity'].map(tab => (
                <button
                  key={tab}
                  role="tab"
                  aria-selected={activeTab === tab}
                  aria-controls={`${tab}-panel`}
                  id={`${tab}-tab`}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-charcoal-500 hover:text-charcoal-700'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {tab === 'comments' && comments.length > 0 && (
                    <span className="ml-2 px-2 py-0.5 rounded-full bg-charcoal-200 text-xs">
                      {comments.length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6 max-h-[600px] overflow-y-auto" role="tabpanel" id={`${activeTab}-panel`} aria-labelledby={`${activeTab}-tab`}>
            {activeTab === 'details' && (
              <div className="space-y-6">
                {/* Item Details */}
                <div>
                  <h4 className="text-sm font-medium text-charcoal-900 mb-3">Item Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-charcoal-500">Phase:</span>
                      <span className="ml-2 font-medium">{item.phase}</span>
                    </div>
                    <div>
                      <span className="text-charcoal-500">Owner:</span>
                      <span className="ml-2 font-medium">{item.owner}</span>
                    </div>
                    <div>
                      <span className="text-charcoal-500">Category:</span>
                      <span className="ml-2 font-medium">{item.category}</span>
                    </div>
                    <div>
                      <span className="text-charcoal-500">Effort:</span>
                      <span className="ml-2 font-medium">{item.effortLevel}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-charcoal-500">Deliverable Type:</span>
                      <span className="ml-2 font-medium">{item.deliverableType}</span>
                    </div>
                  </div>
                </div>

                {/* Assignment Section */}
                <div className="border-t pt-6">
                  <h4 className="text-sm font-medium text-charcoal-900 mb-3">Assignment</h4>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-charcoal-700 mb-2 flex items-center gap-2">
                        Assigned To
                        <Tooltip text={FIELD_HELP.assignedTo}>
                          <HelpCircle className="w-4 h-4 text-charcoal-400 hover:text-charcoal-600" />
                        </Tooltip>
                      </label>
                      <input
                        type="text"
                        placeholder="Enter user IDs or emails (comma-separated)"
                        value={assignmentData.assignedTo.join(', ')}
                        onChange={(e) => setAssignmentData(prev => ({
                          ...prev,
                          assignedTo: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                        }))}
                        className="input"
                      />
                      <p className="mt-1 text-xs text-charcoal-500">
                        Team members responsible for completing this item
                      </p>
                    </div>

                    {/* Timeline Fields */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-charcoal-700 mb-2 flex items-center gap-2">
                          <Calendar className="inline w-4 h-4" />
                          Start Date
                          <Tooltip text={FIELD_HELP.startDate}>
                            <HelpCircle className="w-3.5 h-3.5 text-charcoal-400 hover:text-charcoal-600" />
                          </Tooltip>
                        </label>
                        <DatePicker
                          selected={assignmentData.startDate}
                          onChange={(date) => setAssignmentData(prev => ({
                            ...prev,
                            startDate: date
                          }))}
                          dateFormat="MMM d, yyyy"
                          placeholderText="Select start date"
                          className="input w-full"
                          isClearable
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-charcoal-700 mb-2 flex items-center gap-2">
                          <CalendarClock className="inline w-4 h-4" />
                          Due Date
                          <Tooltip text={FIELD_HELP.dueDate}>
                            <HelpCircle className="w-3.5 h-3.5 text-charcoal-400 hover:text-charcoal-600" />
                          </Tooltip>
                          {assignmentData.dueDate && isOverdue(assignmentData.dueDate, isCompleted) && (
                            <AlertCircle className="inline w-4 h-4 text-red-600" />
                          )}
                        </label>
                        <DatePicker
                          selected={assignmentData.dueDate}
                          onChange={(date) => setAssignmentData(prev => ({
                            ...prev,
                            dueDate: date
                          }))}
                          dateFormat="MMM d, yyyy"
                          placeholderText="Select due date"
                          className={`input w-full ${getDueDateColor(assignmentData.dueDate, isCompleted)}`}
                          minDate={assignmentData.startDate || new Date()}
                          isClearable
                        />
                        {assignmentData.dueDate && (
                          <p className={`text-xs mt-1 ${getDueDateColor(assignmentData.dueDate, isCompleted)}`}>
                            {getRelativeDate(assignmentData.dueDate)}
                            {isOverdue(assignmentData.dueDate, isCompleted) && ' - Overdue!'}
                            {isDueSoon(assignmentData.dueDate) && !isOverdue(assignmentData.dueDate, isCompleted) && ' - Due soon'}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-charcoal-700 mb-2 flex items-center gap-2">
                          <Clock className="inline w-4 h-4" />
                          Estimated Hours
                          <Tooltip text={FIELD_HELP.estimatedHours}>
                            <HelpCircle className="w-3.5 h-3.5 text-charcoal-400 hover:text-charcoal-600" />
                          </Tooltip>
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

                      {assignmentData.completedDate && (
                        <div>
                          <label className="block text-sm font-medium text-charcoal-700 mb-2 flex items-center gap-2">
                            <Check className="inline w-4 h-4 text-green-600" />
                            Completed Date
                          </label>
                          <div className="input bg-green-50 text-green-800 font-medium">
                            {formatDate(assignmentData.completedDate)}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Notes Field */}
                    <div>
                      <label className="block text-sm font-medium text-charcoal-700 mb-2 flex items-center gap-2">
                        Notes
                        <Tooltip text={FIELD_HELP.notes}>
                          <HelpCircle className="w-3.5 h-3.5 text-charcoal-400 hover:text-charcoal-600" />
                        </Tooltip>
                      </label>
                      <textarea
                        value={assignmentData.notes}
                        onChange={(e) => setAssignmentData(prev => ({
                          ...prev,
                          notes: e.target.value
                        }))}
                        placeholder="Add notes about this task (blockers, special instructions, etc.)"
                        rows={3}
                        className="input w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-charcoal-700 mb-2 flex items-center gap-2">
                        Status
                        <Tooltip text={FIELD_HELP.status}>
                          <HelpCircle className="w-3.5 h-3.5 text-charcoal-400 hover:text-charcoal-600" />
                        </Tooltip>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(TASK_STATUS_LABELS).map(([value, label]) => (
                          <button
                            key={value}
                            onClick={() => handleStatusChange(value)}
                            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                              assignmentData.status === value
                                ? 'bg-primary-600 text-white'
                                : 'bg-charcoal-100 text-charcoal-700 hover:bg-charcoal-200'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                      <p className="mt-2 text-xs text-charcoal-500">
                        {assignmentData.status === 'not_started' && 'Task has not been worked on yet'}
                        {assignmentData.status === 'in_progress' && 'Work is actively being done on this task'}
                        {assignmentData.status === 'in_review' && 'Task is complete and awaiting review/approval'}
                        {assignmentData.status === 'completed' && 'Task has been finished and approved'}
                      </p>
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

            {activeTab === 'time' && (
              <TimeTracker
                projectId={projectId}
                itemId={item.id}
                estimatedHours={assignmentData.estimatedHours}
              />
            )}

            {activeTab === 'files' && (
              <FileUpload
                projectId={projectId}
                itemId={item.id}
              />
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
                <h4 className="text-sm font-medium text-charcoal-900 mb-3">Recent Activity</h4>
                {itemActivities.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-charcoal-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Activity className="w-6 h-6 text-charcoal-400" />
                    </div>
                    <p className="text-sm font-medium text-charcoal-700 mb-1">No activity recorded</p>
                    <p className="text-xs text-charcoal-500 max-w-xs mx-auto">
                      Activity will appear here when team members make changes like updating status, leaving comments, or tracking time.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {itemActivities.map((activity, index) => (
                      <div key={index} className="flex items-start gap-3 text-sm">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Activity className="w-4 h-4 text-primary-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-charcoal-900">
                            <span className="font-medium">{activity.userName}</span>{' '}
                            {activity.action.replace('_', ' ')}
                          </p>
                          <p className="text-charcoal-500 text-xs mt-0.5">
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
          <div className="bg-charcoal-50 px-6 py-4 flex justify-between">
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
