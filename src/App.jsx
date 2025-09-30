import { useState, useEffect } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';

// API Client
const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://lab-test-backend-1.onrender.com/api/v1',
  headers: { 'Content-Type': 'application/json' }
});

// API Functions
const api = {
  createBooking: (payload) => client.post('/bookings', payload),
  getBookingsByPhone: (phone) => client.get(`/bookings/phone/9998887777`),
  getBookingById: (id) => client.get(`/bookings/${id}`),
  updateBookingById: (id, payload) => client.put(`/bookings/${id}`, payload),
  cancelBookingById: (id) => client.delete(`/bookings/${id}`),
  updateBookingByPhone: (phone, payload) => client.put(`/bookings/phone/${phone}`, payload),
  cancelBookingByPhone: (phone) => client.delete(`/bookings/phone/${phone}`)
};

// Toast Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const toastStyles = {
    position: 'fixed',
    top: '20px',
    right: '20px',
    padding: '12px 20px',
    borderRadius: '6px',
    color: 'white',
    fontWeight: '600',
    zIndex: 1000,
    maxWidth: '400px',
    backgroundColor: type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
  };

  return (
    <div style={toastStyles}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>{message}</span>
        <button 
          onClick={onClose} 
          style={{ 
            background: 'none', 
            border: 'none', 
            color: 'white', 
            fontSize: '18px', 
            cursor: 'pointer',
            marginLeft: '10px'
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
};

// Status Badge Component
const StatusBadge = ({ status }) => {
  const getStatusStyle = (status) => {
    const baseStyle = {
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
      textTransform: 'capitalize'
    };

    switch (status) {
      case 'confirmed':
        return { ...baseStyle, backgroundColor: '#dcfce7', color: '#166534' };
      case 'in_progress':
        return { ...baseStyle, backgroundColor: '#fed7aa', color: '#9a3412' };
      case 'completed':
        return { ...baseStyle, backgroundColor: '#dbeafe', color: '#1e40af' };
      case 'cancelled':
        return { ...baseStyle, backgroundColor: '#f3f4f6', color: '#374151', textDecoration: 'line-through' };
      default:
        return { ...baseStyle, backgroundColor: '#f3f4f6', color: '#374151' };
    }
  };

  return (
    <span style={getStatusStyle(status)}>
      {status.replace('_', ' ')}
    </span>
  );
};

// Phone Search Component
const PhoneSearch = ({ onBookingsFound, onCreateNew, showToast }) => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!phone.trim()) {
      showToast('Please enter a phone number', 'error');
      return;
    }

    if (!/^\d{10,12}$/.test(phone.replace(/\D/g, ''))) {
      showToast('Please enter a valid phone number (10-12 digits)', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await api.getBookingsByPhone(phone);
      onBookingsFound(response.data.data);
      showToast(response.data.message, 'success');
    } catch (error) {
      if (error.response?.status === 404) {
        showToast('No bookings found for this phone number', 'info');
        onCreateNew();
      } else {
        showToast(error.response?.data?.message || 'Error searching bookings', 'error');
      }
    }
    setLoading(false);
  };

  const containerStyle = {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    maxWidth: '500px',
    margin: '0 auto'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '16px',
    marginBottom: '20px',
    outline: 'none',
    transition: 'border-color 0.2s'
  };

  const buttonStyle = {
    width: '100%',
    padding: '12px 24px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    marginBottom: '15px'
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#6b7280'
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ textAlign: 'center', marginBottom: '25px', color: '#1f2937', fontSize: '24px' }}>
        Lab Test Booking System
      </h2>
      <form onSubmit={handleSearch}>
        <input
          style={inputStyle}
          type="tel"
          placeholder="Enter phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
          onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
        />
        <button 
          type="submit" 
          style={buttonStyle}
          disabled={loading}
          onMouseOver={(e) => !loading && (e.target.style.backgroundColor = '#2563eb')}
          onMouseOut={(e) => !loading && (e.target.style.backgroundColor = '#3b82f6')}
        >
          {loading ? 'Searching...' : 'Search Bookings'}
        </button>
      </form>
      <button 
        style={secondaryButtonStyle}
        onClick={onCreateNew}
        onMouseOver={(e) => e.target.style.backgroundColor = '#4b5563'}
        onMouseOut={(e) => e.target.style.backgroundColor = '#6b7280'}
      >
        Create New Booking
      </button>
    </div>
  );
};

// Bookings List Component
const BookingsList = ({ bookings, onViewDetails, onUpdateStatus, onCancel, onBack, showToast }) => {
  const [updatingBookings, setUpdatingBookings] = useState(new Set());

  const handleStatusUpdate = async (bookingId, newStatus) => {
    setUpdatingBookings(prev => new Set(prev).add(bookingId));
    try {
      await api.updateBookingById(bookingId, { booking_status: newStatus });
      showToast('Booking status updated successfully', 'success');
      // Refresh the bookings list
      window.location.reload();
    } catch (error) {
      showToast(error.response?.data?.message || 'Error updating booking', 'error');
    }
    setUpdatingBookings(prev => {
      const newSet = new Set(prev);
      newSet.delete(bookingId);
      return newSet;
    });
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    
    try {
      await api.cancelBookingById(bookingId);
      showToast('Booking cancelled successfully', 'success');
      onCancel();
    } catch (error) {
      showToast(error.response?.data?.message || 'Error cancelling booking', 'error');
    }
  };

  const containerStyle = {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    maxWidth: '800px',
    margin: '0 auto'
  };

  const bookingCardStyle = {
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '15px',
    backgroundColor: '#f9fafb'
  };

  const buttonStyle = {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    marginRight: '10px',
    transition: 'background-color 0.2s'
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#3b82f6',
    color: 'white'
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#6b7280',
    color: 'white'
  };

  const dangerButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#ef4444',
    color: 'white'
  };

  const backButtonStyle = {
    ...primaryButtonStyle,
    marginBottom: '20px'
  };

  return (
    <div style={containerStyle}>
      <button 
        style={backButtonStyle} 
        onClick={onBack}
        onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
        onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
      >
        ← Back to Search
      </button>
      
      <h2 style={{ marginBottom: '25px', color: '#1f2937', fontSize: '24px' }}>
        Your Bookings ({bookings?.total_bookings || 0})
      </h2>

      {bookings?.latest_booking && (
        <div style={{ ...bookingCardStyle, borderColor: '#3b82f6', borderWidth: '2px' }}>
          <h3 style={{ color: '#1f2937', marginBottom: '10px' }}>Latest Booking</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '15px' }}>
            <div><strong>Test:</strong> {bookings.latest_booking.test_name}</div>
            <div><strong>Date:</strong> {bookings.latest_booking.appointment_date}</div>
            <div><strong>Time:</strong> {bookings.latest_booking.appointment_time}</div>
            <div><strong>Type:</strong> {bookings.latest_booking.booking_type}</div>
            <div><StatusBadge status={bookings.latest_booking.status?.toLowerCase() || 'confirmed'} /></div>
          </div>
          <div>
            <button 
              style={primaryButtonStyle}
              onClick={() => onViewDetails(bookings.latest_booking.booking_id)}
              onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
            >
              View Details
            </button>
            
            {bookings.latest_booking.status?.toLowerCase() === 'confirmed' && (
              <button 
                style={secondaryButtonStyle}
                onClick={() => handleStatusUpdate(bookings.latest_booking.booking_id, 'in_progress')}
                disabled={updatingBookings.has(bookings.latest_booking.booking_id)}
                onMouseOver={(e) => !updatingBookings.has(bookings.latest_booking.booking_id) && (e.target.style.backgroundColor = '#4b5563')}
                onMouseOut={(e) => !updatingBookings.has(bookings.latest_booking.booking_id) && (e.target.style.backgroundColor = '#6b7280')}
              >
                {updatingBookings.has(bookings.latest_booking.booking_id) ? 'Updating...' : 'Start Processing'}
              </button>
            )}
            
            {bookings.latest_booking.status?.toLowerCase() === 'in_progress' && (
              <button 
                style={secondaryButtonStyle}
                onClick={() => handleStatusUpdate(bookings.latest_booking.booking_id, 'completed')}
                disabled={updatingBookings.has(bookings.latest_booking.booking_id)}
                onMouseOver={(e) => !updatingBookings.has(bookings.latest_booking.booking_id) && (e.target.style.backgroundColor = '#4b5563')}
                onMouseOut={(e) => !updatingBookings.has(bookings.latest_booking.booking_id) && (e.target.style.backgroundColor = '#6b7280')}
              >
                {updatingBookings.has(bookings.latest_booking.booking_id) ? 'Updating...' : 'Mark Complete'}
              </button>
            )}
            
            {!['completed', 'cancelled'].includes(bookings.latest_booking.status?.toLowerCase()) && (
              <button 
                style={dangerButtonStyle}
                onClick={() => handleCancel(bookings.latest_booking.booking_id)}
                onMouseOver={(e) => e.target.style.backgroundColor = '#dc2626'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#ef4444'}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}

      {bookings?.bookings && bookings.bookings.length > 1 && (
        <div>
          <h3 style={{ color: '#1f2937', marginBottom: '15px', fontSize: '18px' }}>All Bookings</h3>
          {bookings.bookings.map((booking) => (
            <div key={booking.booking_id} style={bookingCardStyle}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '15px' }}>
                <div><strong>ID:</strong> {booking.booking_id}</div>
                <div><strong>Test:</strong> {booking.test_name}</div>
                <div><strong>Date:</strong> {booking.appointment_date}</div>
                <div><strong>Time:</strong> {booking.appointment_time}</div>
                <div><strong>Type:</strong> {booking.booking_type}</div>
                <div><StatusBadge status={booking.status?.toLowerCase() || 'confirmed'} /></div>
              </div>
              <button 
                style={primaryButtonStyle}
                onClick={() => onViewDetails(booking.booking_id)}
                onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Create Booking Form Component
const CreateBookingForm = ({ onBack, onSuccess, showToast }) => {
  const [formData, setFormData] = useState({
    phone_number: '',
    customer_name: '',
    customer_email: '',
    booking_type: 'home_collection',
    test_code: '',
    test_name: '',
    total_price: '',
    appointment_date: '',
    appointment_time: '',
    address: '',
    lab_id: '',
    phlebotomist_id: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const { phone_number, customer_name, booking_type, test_code, test_name, total_price, appointment_date, appointment_time } = formData;
    
    if (!phone_number || !/^\d{10,12}$/.test(phone_number.replace(/\D/g, ''))) {
      showToast('Please enter a valid phone number (10-12 digits)', 'error');
      return false;
    }
    
    if (!customer_name.trim()) {
      showToast('Customer name is required', 'error');
      return false;
    }
    
    if (formData.customer_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customer_email)) {
      showToast('Please enter a valid email address', 'error');
      return false;
    }
    
    if (!test_code.trim()) {
      showToast('Test code is required', 'error');
      return false;
    }
    
    if (!test_name.trim()) {
      showToast('Test name is required', 'error');
      return false;
    }
    
    if (!total_price || isNaN(total_price) || parseFloat(total_price) <= 0) {
      showToast('Please enter a valid price', 'error');
      return false;
    }
    
    if (!appointment_date) {
      showToast('Appointment date is required', 'error');
      return false;
    }
    
    if (dayjs(appointment_date).isBefore(dayjs(), 'day')) {
      showToast('Appointment date must be today or in the future', 'error');
      return false;
    }
    
    if (!appointment_time) {
      showToast('Appointment time is required', 'error');
      return false;
    }
    
    if (booking_type === 'home_collection') {
      if (!formData.address.trim()) {
        showToast('Address is required for home collection', 'error');
        return false;
      }
      if (!formData.phlebotomist_id.trim()) {
        showToast('Phlebotomist ID is required for home collection', 'error');
        return false;
      }
    }
    
    if (booking_type === 'walk_in_lab' && !formData.lab_id.trim()) {
      showToast('Lab ID is required for walk-in lab booking', 'error');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const payload = {
        ...formData,
        total_price: parseFloat(formData.total_price)
      };
      
      // Remove empty optional fields
      if (!payload.customer_email) delete payload.customer_email;
      if (payload.booking_type === 'home_collection') {
        delete payload.lab_id;
      } else {
        delete payload.address;
        delete payload.phlebotomist_id;
      }
      
      const response = await api.createBooking(payload);
      showToast(response.data.message, 'success');
      onSuccess(response.data.data);
    } catch (error) {
      showToast(error.response?.data?.message || 'Error creating booking', 'error');
    }
    setLoading(false);
  };

  const containerStyle = {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    maxWidth: '600px',
    margin: '0 auto'
  };

  const formGroupStyle = {
    marginBottom: '20px'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '5px',
    fontWeight: '600',
    color: '#374151'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '16px',
    outline: 'none',
    transition: 'border-color 0.2s'
  };

  const selectStyle = {
    ...inputStyle,
    backgroundColor: 'white'
  };

  const buttonStyle = {
    padding: '12px 24px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    marginRight: '10px'
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#3b82f6',
    color: 'white'
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#6b7280',
    color: 'white'
  };

  return (
    <div style={containerStyle}>
      <button 
        style={secondaryButtonStyle} 
        onClick={onBack}
        onMouseOver={(e) => e.target.style.backgroundColor = '#4b5563'}
        onMouseOut={(e) => e.target.style.backgroundColor = '#6b7280'}
      >
        ← Back
      </button>
      
      <h2 style={{ margin: '20px 0', color: '#1f2937', fontSize: '24px' }}>Create New Booking</h2>
      
      <form onSubmit={handleSubmit}>
        <div style={formGroupStyle}>
          <label style={labelStyle}>Phone Number *</label>
          <input
            style={inputStyle}
            type="tel"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
            placeholder="Enter 10-12 digit phone number"
            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
          />
        </div>

        <div style={formGroupStyle}>
          <label style={labelStyle}>Customer Name *</label>
          <input
            style={inputStyle}
            type="text"
            name="customer_name"
            value={formData.customer_name}
            onChange={handleChange}
            placeholder="Enter customer name"
            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
          />
        </div>

        <div style={formGroupStyle}>
          <label style={labelStyle}>Customer Email</label>
          <input
            style={inputStyle}
            type="email"
            name="customer_email"
            value={formData.customer_email}
            onChange={handleChange}
            placeholder="Enter email address (optional)"
            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
          />
        </div>

        <div style={formGroupStyle}>
          <label style={labelStyle}>Booking Type *</label>
          <select
            style={selectStyle}
            name="booking_type"
            value={formData.booking_type}
            onChange={handleChange}
            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
          >
            <option value="home_collection">Home Collection</option>
            <option value="walk_in_lab">Walk-in Lab</option>
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
          <div>
            <label style={labelStyle}>Test Code *</label>
            <input
              style={inputStyle}
              type="text"
              name="test_code"
              value={formData.test_code}
              onChange={handleChange}
              placeholder="e.g., CBC"
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>
          <div>
            <label style={labelStyle}>Total Price *</label>
            <input
              style={inputStyle}
              type="number"
              name="total_price"
              value={formData.total_price}
              onChange={handleChange}
              placeholder="Enter price"
              min="0"
              step="0.01"
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>
        </div>

        <div style={formGroupStyle}>
          <label style={labelStyle}>Test Name *</label>
          <input
            style={inputStyle}
            type="text"
            name="test_name"
            value={formData.test_name}
            onChange={handleChange}
            placeholder="e.g., Complete Blood Count"
            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
          <div>
            <label style={labelStyle}>Appointment Date *</label>
            <input
              style={inputStyle}
              type="date"
              name="appointment_date"
              value={formData.appointment_date}
              onChange={handleChange}
              min={dayjs().format('YYYY-MM-DD')}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>
          <div>
            <label style={labelStyle}>Appointment Time *</label>
            <input
              style={inputStyle}
              type="time"
              name="appointment_time"
              value={formData.appointment_time}
              onChange={handleChange}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>
        </div>

        {formData.booking_type === 'home_collection' && (
          <>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Address *</label>
              <textarea
                style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter complete address for home collection"
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Phlebotomist ID *</label>
              <input
                style={inputStyle}
                type="text"
                name="phlebotomist_id"
                value={formData.phlebotomist_id}
                onChange={handleChange}
                placeholder="e.g., PHL123"
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>
          </>
        )}

        {formData.booking_type === 'walk_in_lab' && (
          <div style={formGroupStyle}>
            <label style={labelStyle}>Lab ID *</label>
            <input
              style={inputStyle}
              type="text"
              name="lab_id"
              value={formData.lab_id}
              onChange={handleChange}
              placeholder="e.g., LAB001"
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>
        )}

        <div style={{ marginTop: '30px' }}>
          <button 
            type="submit" 
            style={primaryButtonStyle}
            disabled={loading}
            onMouseOver={(e) => !loading && (e.target.style.backgroundColor = '#2563eb')}
            onMouseOut={(e) => !loading && (e.target.style.backgroundColor = '#3b82f6')}
          >
            {loading ? 'Creating Booking...' : 'Create Booking'}
          </button>
        </div>
      </form>
    </div>
  );
};

// Booking Details Component
const BookingDetails = ({ bookingId, onBack, showToast }) => {
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchBookingDetails();
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      const response = await api.getBookingById(bookingId);
      setBooking(response.data.data);
    } catch (error) {
      showToast(error.response?.data?.message || 'Error fetching booking details', 'error');
      onBack();
    }
    setLoading(false);
  };

  const handleStatusUpdate = async (newStatus) => {
    setUpdating(true);
    try {
      await api.updateBookingById(bookingId, { booking_status: newStatus });
      showToast('Booking status updated successfully', 'success');
      fetchBookingDetails();
    } catch (error) {
      showToast(error.response?.data?.message || 'Error updating booking', 'error');
    }
    setUpdating(false);
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    
    try {
      await api.cancelBookingById(bookingId);
      showToast('Booking cancelled successfully', 'success');
      onBack();
    } catch (error) {
      showToast(error.response?.data?.message || 'Error cancelling booking', 'error');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div style={{ fontSize: '18px', color: '#6b7280' }}>Loading booking details...</div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div style={{ fontSize: '18px', color: '#ef4444' }}>Booking not found</div>
      </div>
    );
  }

  const containerStyle = {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    maxWidth: '700px',
    margin: '0 auto'
  };

  const buttonStyle = {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    marginRight: '10px',
    marginBottom: '10px',
    transition: 'background-color 0.2s'
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#3b82f6',
    color: 'white'
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#6b7280',
    color: 'white'
  };

  const dangerButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#ef4444',
    color: 'white'
  };

  const detailRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #f3f4f6'
  };

  const labelStyle = {
    fontWeight: '600',
    color: '#374151',
    minWidth: '150px'
  };

  const valueStyle = {
    color: '#1f2937',
    flex: 1,
    textAlign: 'right'
  };

  return (
    <div style={containerStyle}>
      <button 
        style={secondaryButtonStyle} 
        onClick={onBack}
        onMouseOver={(e) => e.target.style.backgroundColor = '#4b5563'}
        onMouseOut={(e) => e.target.style.backgroundColor = '#6b7280'}
      >
        ← Back
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 0' }}>
        <h2 style={{ color: '#1f2937', fontSize: '24px', margin: 0 }}>Booking Details</h2>
        <StatusBadge status={booking.booking_status} />
      </div>

      <div style={{ backgroundColor: '#f9fafb', padding: '20px', borderRadius: '8px', marginBottom: '25px' }}>
        <div style={detailRowStyle}>
          <span style={labelStyle}>Booking ID:</span>
          <span style={valueStyle}>{booking.booking_id}</span>
        </div>
        
        <div style={detailRowStyle}>
          <span style={labelStyle}>Customer Name:</span>
          <span style={valueStyle}>{booking.customer_name}</span>
        </div>
        
        <div style={detailRowStyle}>
          <span style={labelStyle}>Phone Number:</span>
          <span style={valueStyle}>{booking.phone_number}</span>
        </div>
        
        {booking.customer_email && (
          <div style={detailRowStyle}>
            <span style={labelStyle}>Email:</span>
            <span style={valueStyle}>{booking.customer_email}</span>
          </div>
        )}
        
        <div style={detailRowStyle}>
          <span style={labelStyle}>Test:</span>
          <span style={valueStyle}>{booking.test_name} ({booking.test_code})</span>
        </div>
        
        <div style={detailRowStyle}>
          <span style={labelStyle}>Price:</span>
          <span style={valueStyle}>₹{booking.total_price}</span>
        </div>
        
        <div style={detailRowStyle}>
          <span style={labelStyle}>Appointment:</span>
          <span style={valueStyle}>
            {dayjs(booking.appointment_date).format('DD MMM YYYY')} at {booking.appointment_time}
          </span>
        </div>
        
        <div style={detailRowStyle}>
          <span style={labelStyle}>Booking Type:</span>
          <span style={valueStyle}>{booking.booking_type.replace('_', ' ')}</span>
        </div>
        
        {booking.booking_type === 'home_collection' && booking.address && (
          <div style={detailRowStyle}>
            <span style={labelStyle}>Address:</span>
            <span style={valueStyle}>{booking.address}</span>
          </div>
        )}
        
        {booking.booking_type === 'home_collection' && booking.phlebotomist_id && (
          <div style={detailRowStyle}>
            <span style={labelStyle}>Phlebotomist ID:</span>
            <span style={valueStyle}>{booking.phlebotomist_id}</span>
          </div>
        )}
        
        {booking.booking_type === 'walk_in_lab' && booking.lab_id && (
          <div style={detailRowStyle}>
            <span style={labelStyle}>Lab ID:</span>
            <span style={valueStyle}>{booking.lab_id}</span>
          </div>
        )}
        
        <div style={detailRowStyle}>
          <span style={labelStyle}>Created:</span>
          <span style={valueStyle}>
            {dayjs(booking.created_at).format('DD MMM YYYY, HH:mm')}
          </span>
        </div>
        
        {booking.updated_at && booking.updated_at !== booking.created_at && (
          <div style={detailRowStyle}>
            <span style={labelStyle}>Last Updated:</span>
            <span style={valueStyle}>
              {dayjs(booking.updated_at).format('DD MMM YYYY, HH:mm')}
            </span>
          </div>
        )}
      </div>

      <div>
        <h3 style={{ color: '#1f2937', marginBottom: '15px' }}>Actions</h3>
        
        {booking.booking_status === 'confirmed' && (
          <button 
            style={secondaryButtonStyle}
            onClick={() => handleStatusUpdate('in_progress')}
            disabled={updating}
            onMouseOver={(e) => !updating && (e.target.style.backgroundColor = '#4b5563')}
            onMouseOut={(e) => !updating && (e.target.style.backgroundColor = '#6b7280')}
          >
            {updating ? 'Updating...' : 'Start Processing'}
          </button>
        )}
        
        {booking.booking_status === 'in_progress' && (
          <button 
            style={secondaryButtonStyle}
            onClick={() => handleStatusUpdate('completed')}
            disabled={updating}
            onMouseOver={(e) => !updating && (e.target.style.backgroundColor = '#4b5563')}
            onMouseOut={(e) => !updating && (e.target.style.backgroundColor = '#6b7280')}
          >
            {updating ? 'Updating...' : 'Mark Complete'}
          </button>
        )}
        
        {!['completed', 'cancelled'].includes(booking.booking_status) && (
          <button 
            style={dangerButtonStyle}
            onClick={handleCancel}
            onMouseOver={(e) => e.target.style.backgroundColor = '#dc2626'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#ef4444'}
          >
            Cancel Booking
          </button>
        )}
      </div>
    </div>
  );
};

// Success Component
const BookingSuccess = ({ bookingData, onBack, onCreateAnother }) => {
  const containerStyle = {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '10px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    maxWidth: '500px',
    margin: '0 auto',
    textAlign: 'center'
  };

  const buttonStyle = {
    padding: '12px 24px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    margin: '10px',
    transition: 'background-color 0.2s'
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#3b82f6',
    color: 'white'
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#6b7280',
    color: 'white'
  };

  return (
    <div style={containerStyle}>
      <div style={{ fontSize: '48px', color: '#10b981', marginBottom: '20px' }}>✓</div>
      
      <h2 style={{ color: '#1f2937', marginBottom: '20px', fontSize: '24px' }}>
        Booking Created Successfully!
      </h2>
      
      <div style={{ backgroundColor: '#f0fdf4', padding: '20px', borderRadius: '8px', marginBottom: '25px' }}>
        <div style={{ marginBottom: '10px' }}>
          <strong>Booking ID:</strong> {bookingData.booking_id}
        </div>
        <div style={{ marginBottom: '10px' }}>
          <strong>Reference:</strong> {bookingData.booking_reference}
        </div>
        <div>
          <strong>Created:</strong> {dayjs(bookingData.created_at).format('DD MMM YYYY, HH:mm')}
        </div>
      </div>
      
      <p style={{ color: '#6b7280', marginBottom: '25px' }}>
        Your booking has been confirmed. You will receive notifications about your appointment.
      </p>
      
      <div>
        <button 
          style={primaryButtonStyle}
          onClick={onBack}
          onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
        >
          Back to Home
        </button>
        
        <button 
          style={secondaryButtonStyle}
          onClick={onCreateAnother}
          onMouseOver={(e) => e.target.style.backgroundColor = '#4b5563'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#6b7280'}
        >
          Create Another Booking
        </button>
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  const [currentView, setCurrentView] = useState('search'); // search, bookings, create, details, success
  const [bookings, setBookings] = useState(null);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [successData, setSuccessData] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const closeToast = () => {
    setToast(null);
  };

  const handleBookingsFound = (bookingsData) => {
    setBookings(bookingsData);
    setCurrentView('bookings');
  };

  const handleCreateNew = () => {
    setCurrentView('create');
  };

  const handleViewDetails = (bookingId) => {
    setSelectedBookingId(bookingId);
    setCurrentView('details');
  };

  const handleBookingSuccess = (data) => {
    setSuccessData(data);
    setCurrentView('success');
  };

  const handleBack = () => {
    setCurrentView('search');
    setBookings(null);
    setSelectedBookingId(null);
    setSuccessData(null);
  };

  const handleCreateAnother = () => {
    setCurrentView('create');
    setSuccessData(null);
  };

  const handleBookingUpdate = () => {
    // Refresh bookings data after update
    if (bookings) {
      // This would typically refetch the bookings
      handleBack();
    }
  };

  const appStyle = {
    minHeight: '100vh',
    backgroundColor: '#f3f4f6',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
  };

  return (
    <div style={appStyle}>
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={closeToast} 
        />
      )}

      {currentView === 'search' && (
        <PhoneSearch
          onBookingsFound={handleBookingsFound}
          onCreateNew={handleCreateNew}
          showToast={showToast}
        />
      )}

      {currentView === 'bookings' && bookings && (
        <BookingsList
          bookings={bookings}
          onViewDetails={handleViewDetails}
          onUpdateStatus={handleBookingUpdate}
          onCancel={handleBookingUpdate}
          onBack={handleBack}
          showToast={showToast}
        />
      )}

      {currentView === 'create' && (
        <CreateBookingForm
          onBack={handleBack}
          onSuccess={handleBookingSuccess}
          showToast={showToast}
        />
      )}

      {currentView === 'details' && selectedBookingId && (
        <BookingDetails
          bookingId={selectedBookingId}
          onBack={() => setCurrentView('bookings')}
          showToast={showToast}
        />
      )}

      {currentView === 'success' && successData && (
        <BookingSuccess
          bookingData={successData}
          onBack={handleBack}
          onCreateAnother={handleCreateAnother}
        />
      )}
    </div>
  );
};

export default App;