import { ImagePlus, Pencil, Plus, Trash2, Users as UsersIcon, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import api, { getErrorMessage } from '../api/client';
import FormMessage from '../components/FormMessage';
import PageHeader from '../components/PageHeader';

import { formatCurrency } from '../utils/booking';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const initialForm = {
  roomName: '',
  roomType: '',
  capacity: 2,
  pricePerHour: 0,
  status: 'available',
  description: '',
};

const statusLabels = {
  available: 'Có thể đặt',
  maintenance: 'Bảo trì',
  inactive: 'Ngưng dùng',
};

const statusColors = {
  available: 'bg-emerald-400',
  maintenance: 'bg-amber-400',
  inactive: 'bg-rose-400',
};

const RoomsPage = () => {

  const [rooms, setRooms] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [editingId, setEditingId] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const isAdmin = true;

  const fetchRooms = async () => {
    const res = await api.get('/rooms');
    setRooms(res.data);
  };

  useEffect(() => {
    fetchRooms().catch((err) => setError(getErrorMessage(err)));
  }, []);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Chỉ chấp nhận file ảnh (jpg, png, gif, webp)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File ảnh không được vượt quá 5MB');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('roomName', form.roomName);
      formData.append('roomType', form.roomType);
      formData.append('capacity', form.capacity);
      formData.append('pricePerHour', form.pricePerHour);
      formData.append('status', form.status);
      formData.append('description', form.description);

      if (imageFile) {
        formData.append('image', imageFile);
      }

      if (editingId) {
        await api.put(`/rooms/${editingId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setMessage('Đã cập nhật phòng');
      } else {
        await api.post('/rooms', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setMessage('Đã thêm phòng');
      }

      setForm(initialForm);
      setEditingId('');
      clearImage();
      await fetchRooms();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleEdit = (room) => {
    setEditingId(room._id);
    setForm({
      roomName: room.roomName,
      roomType: room.roomType,
      capacity: room.capacity,
      pricePerHour: room.pricePerHour,
      status: room.status,
      description: room.description || '',
    });
    // Show existing image as preview
    if (room.image) {
      setImagePreview(`${API_BASE}${room.image}`);
    } else {
      setImagePreview('');
    }
    setImageFile(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa phòng này?')) return;

    try {
      await api.delete(`/rooms/${id}`);
      await fetchRooms();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const cancelEdit = () => {
    setForm(initialForm);
    setEditingId('');
    clearImage();
  };

  return (
    <>
      <PageHeader title="Quản lý phòng" description="Danh sách phòng, giá theo giờ và trạng thái vận hành." />

      <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
        {/* Form */}
        <form className="panel p-5 h-fit" onSubmit={handleSubmit}>
          <h2 className="mb-4 text-base font-bold gradient-text">
            {editingId ? 'Sửa phòng' : 'Thêm phòng'}
          </h2>
          <div className="space-y-4">
            <FormMessage>{error}</FormMessage>
            <FormMessage type="success">{message}</FormMessage>

            <div>
              <label className="label" htmlFor="room-name">Tên phòng</label>
              <input
                id="room-name"
                className="field"
                value={form.roomName}
                onChange={(event) => setForm({ ...form, roomName: event.target.value })}
                disabled={!isAdmin}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label" htmlFor="room-type">Loại phòng</label>
                <input
                  id="room-type"
                  className="field"
                  value={form.roomType}
                  onChange={(event) => setForm({ ...form, roomType: event.target.value })}
                  disabled={!isAdmin}
                  required
                />
              </div>
              <div>
                <label className="label" htmlFor="room-capacity">Sức chứa</label>
                <input
                  id="room-capacity"
                  className="field"
                  type="number"
                  min="1"
                  value={form.capacity}
                  onChange={(event) => setForm({ ...form, capacity: Number(event.target.value) })}
                  disabled={!isAdmin}
                  required
                />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="room-price">Giá mỗi giờ</label>
              <input
                id="room-price"
                className="field"
                type="number"
                min="0"
                value={form.pricePerHour}
                onChange={(event) => setForm({ ...form, pricePerHour: Number(event.target.value) })}
                disabled={!isAdmin}
                required
              />
            </div>

            <div>
              <label className="label" htmlFor="room-status">Trạng thái</label>
              <select
                id="room-status"
                className="field"
                value={form.status}
                onChange={(event) => setForm({ ...form, status: event.target.value })}
                disabled={!isAdmin}
              >
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label" htmlFor="room-desc">Mô tả</label>
              <textarea
                id="room-desc"
                className="textarea-field"
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                disabled={!isAdmin}
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="label">Ảnh phòng</label>
              <div
                className={`
                  relative mt-1 flex flex-col items-center justify-center rounded-xl border-2 border-dashed
                  transition-all duration-200 overflow-hidden
                  ${imagePreview
                    ? 'border-pine/40 bg-pine/5'
                    : 'border-surface-border bg-surface-hover/30 hover:border-pine/30 hover:bg-pine/5'
                  }
                  ${!isAdmin ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
                `}
                onClick={() => isAdmin && fileInputRef.current?.click()}
              >
                {imagePreview ? (
                  <div className="relative w-full">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-xs font-semibold">Nhấn để đổi ảnh</span>
                    </div>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearImage();
                        }}
                        className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-red-500 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 py-8 px-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-hover text-ink-dim">
                      <ImagePlus size={20} />
                    </div>
                    <span className="text-xs text-ink-dim text-center">
                      Nhấn để chọn ảnh phòng
                      <br />
                      <span className="text-[10px] opacity-60">JPG, PNG, GIF, WebP — tối đa 5MB</span>
                    </span>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                id="room-image"
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="hidden"
                onChange={handleImageChange}
                disabled={!isAdmin}
              />
            </div>

            <div className="flex gap-2">
              <button id="room-submit" className="primary-btn flex-1 justify-center" disabled={!isAdmin}>
                <Plus size={16} />
                {editingId ? 'Lưu phòng' : 'Thêm phòng'}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={cancelEdit}
                >
                  Hủy
                </button>
              )}
            </div>
            {!isAdmin ? (
              <p className="text-xs text-ink-dim">Chỉ admin được thêm, sửa hoặc xóa phòng.</p>
            ) : null}
          </div>
        </form>

        {/* Room cards grid */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 stagger-children">
          {rooms.map((room) => (
            <div
              key={room._id}
              className="panel overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-glow"
            >
              {/* Room image */}
              {room.image ? (
                <div className="relative h-40 w-full overflow-hidden bg-surface-hover">
                  <img
                    src={`${API_BASE}${room.image}`}
                    alt={room.roomName}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute bottom-2 right-2 flex items-center gap-1.5 rounded-lg bg-black/50 backdrop-blur-sm px-2 py-1">
                    <span className={`h-2 w-2 rounded-full ${statusColors[room.status]}`} />
                    <span className="text-[10px] font-semibold text-white">{statusLabels[room.status]}</span>
                  </div>
                </div>
              ) : (
                <div className="relative flex h-28 w-full items-center justify-center bg-gradient-to-br from-surface-hover to-surface-card">
                  <span className="text-4xl opacity-30">🏠</span>
                  <div className="absolute bottom-2 right-2 flex items-center gap-1.5 rounded-lg bg-surface-hover/80 backdrop-blur-sm px-2 py-1">
                    <span className={`h-2 w-2 rounded-full ${statusColors[room.status]}`} />
                    <span className="text-[10px] font-semibold text-ink-muted">{statusLabels[room.status]}</span>
                  </div>
                </div>
              )}

              {/* Card body */}
              <div className="p-5">
                {/* Header */}
                <div className="mb-3">
                  <h3 className="text-lg font-bold text-ink">{room.roomName}</h3>
                  <p className="text-xs text-ink-dim">{room.roomType}</p>
                </div>

                {/* Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-ink-muted">
                    <UsersIcon size={14} className="text-ink-dim" />
                    <span>{room.capacity} người</span>
                  </div>
                  <div className="text-xl font-bold text-pine">
                    {formatCurrency(room.pricePerHour)}
                    <span className="text-xs font-normal text-ink-dim">/giờ</span>
                  </div>
                </div>

                {room.description && (
                  <p className="text-xs text-ink-dim mb-4 line-clamp-2">{room.description}</p>
                )}

                {/* Actions */}
                {isAdmin && (
                  <div className="flex gap-2 border-t border-surface-border pt-3">
                    <button
                      className="secondary-btn flex-1 justify-center !h-8 text-xs"
                      onClick={() => handleEdit(room)}
                    >
                      <Pencil size={13} />
                      Sửa
                    </button>
                    <button
                      className="danger-btn !h-8 !px-3"
                      onClick={() => handleDelete(room._id)}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {rooms.length === 0 && (
            <div className="sm:col-span-2 lg:col-span-3 text-center py-12 text-ink-dim">
              <div className="text-3xl mb-2">🏠</div>
              Chưa có phòng nào.
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default RoomsPage;
