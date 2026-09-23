import React, { useState, useEffect, useCallback } from 'react';
import { Clock, PlusCircle, ArrowUpDown, Trash2, Edit2, AlertCircle, Calendar } from 'lucide-react';
import { api } from '../services/api';
import AddEventModal from '../components/AddEventModal';

const Timeline = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [order, setOrder] = useState('asc'); // chronological: oldest to newest or desc
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getEvents(order);
      setEvents(data);
    } catch (err) {
      setError(err.message || 'Failed to load timeline events');
    } finally {
      setLoading(false);
    }
  }, [order]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleDelete = async (event) => {
    if (window.confirm(`Delete event: "${event.title}"?`)) {
      try {
        await api.deleteEvent(event._id);
        fetchEvents();
      } catch (err) {
        alert(err.message || 'Failed to delete event');
      }
    }
  };

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="h2" style={{ margin: 0 }}>Case Timeline</h1>
          <p className="text-muted" style={{ marginTop: '0.25rem' }}>
            Chronological history of case events and associated expenses.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            className="btn btn-secondary"
            onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')}
            title="Toggle chronological order"
          >
            <ArrowUpDown size={16} />
            <span>{order === 'asc' ? 'Oldest First' : 'Newest First'}</span>
          </button>

          <button
            className="btn btn-primary"
            onClick={() => {
              setEventToEdit(null);
              setIsModalOpen(true);
            }}
          >
            <PlusCircle size={18} />
            Add Event
          </button>
        </div>
      </div>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--danger-bg)', color: 'var(--danger-color)', padding: '0.75rem 1rem', borderRadius: 'var(--border-radius-md)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="card" style={{ padding: 'var(--space-6)', maxWidth: '850px', margin: '0 auto' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <div style={{ width: '32px', height: '32px', border: '3px solid var(--border-color)', borderTopColor: 'var(--primary-light)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
            <p className="text-muted text-small">Loading case events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="empty-state" style={{ border: 'none' }}>
            <Calendar className="empty-icon" />
            <h3 className="empty-title">No timeline events yet</h3>
            <p className="empty-desc">
              Record important milestones such as hearings, filings, and advocate discussions.
            </p>
            <button
              className="btn btn-primary"
              onClick={() => {
                setEventToEdit(null);
                setIsModalOpen(true);
              }}
            >
              <PlusCircle size={18} />
              Add First Case Event
            </button>
          </div>
        ) : (
          <div className="timeline">
            {events.map((event) => {
              const relatedExpense = event.relatedExpenseId;

              return (
                <div className="timeline-item" key={event._id}>
                  <div className="timeline-dot">
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary-light)' }}></div>
                  </div>

                  <div className="timeline-content">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div className="timeline-date">
                        <Clock size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                        {new Date(event.date).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>

                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '0.2rem', border: 'none', background: 'transparent' }}
                          title="Edit Event"
                          onClick={() => {
                            setEventToEdit(event);
                            setIsModalOpen(true);
                          }}
                        >
                          <Edit2 size={14} style={{ color: 'var(--text-secondary)' }} />
                        </button>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '0.2rem', border: 'none', background: 'transparent' }}
                          title="Delete Event"
                          onClick={() => handleDelete(event)}
                        >
                          <Trash2 size={14} style={{ color: 'var(--danger-color)' }} />
                        </button>
                      </div>
                    </div>

                    <h3 className="timeline-title">{event.title}</h3>
                    <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                      {event.description}
                    </p>

                    {event.notes && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', fontStyle: 'italic', marginBottom: '0.5rem' }}>
                        Notes: {event.notes}
                      </div>
                    )}

                    {relatedExpense && (
                      <div className="timeline-expense">
                        NPR {Number(relatedExpense.amount).toLocaleString()} Spent — {relatedExpense.description}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <AddEventModal
        isOpen={isModalOpen}
        eventToEdit={eventToEdit}
        onClose={() => {
          setIsModalOpen(false);
          setEventToEdit(null);
        }}
        onSuccess={fetchEvents}
      />
    </div>
  );
};

export default Timeline;
