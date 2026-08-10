import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import api, { getErrorMessage } from '../api/client';
import FormMessage from '../components/FormMessage';
import PageHeader from '../components/PageHeader';

const initialForm = {
  name: '',
  phone: '',
  facebookName: '',
  note: '',
};

const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const fetchCustomers = async () => {
    const res = await api.get('/customers');
    setCustomers(res.data);
  };

  useEffect(() => {
    fetchCustomers().catch((err) => setError(getErrorMessage(err)));
  }, []);

  const filtered = useMemo(() => {
    if (!search) return customers;
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search)
    );
  }, [customers, search]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    try {
      if (editingId) {
        await api.put(`/customers/${editingId}`, form);
        setMessage('Đã cập nhật khách hàng');
      } else {
        await api.post('/customers', form);
        setMessage('Đã thêm khách hàng');
      }

      setForm(initialForm);
      setEditingId('');
      await fetchCustomers();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleEdit = (customer) => {
    setEditingId(customer._id);
    setForm({
      name: customer.name,
      phone: customer.phone,
      facebookName: customer.facebookName || '',
      note: customer.note || '',
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa khách hàng này?')) return;

    try {
      await api.delete(`/customers/${id}`);
      await fetchCustomers();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <>
      <PageHeader title="Quản lý khách hàng" description="Lưu thông tin khách hỏi phòng qua fanpage hoặc điện thoại." />

      <div className="grid gap-5 grid-cols-1 lg:grid-cols-[380px_1fr]">
        {/* Form */}
        <form className="panel p-5 h-fit" onSubmit={handleSubmit}>
          <h2 className="mb-4 text-base font-bold gradient-text">
            {editingId ? 'Sửa khách hàng' : 'Thêm khách hàng'}
          </h2>
          <div className="space-y-4">
            <FormMessage>{error}</FormMessage>
            <FormMessage type="success">{message}</FormMessage>

            <div>
              <label className="label" htmlFor="customer-name">Tên khách</label>
              <input
                id="customer-name"
                className="field"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                required
              />
            </div>

            <div>
              <label className="label" htmlFor="customer-phone">Số điện thoại</label>
              <input
                id="customer-phone"
                className="field"
                value={form.phone}
                onChange={(event) => setForm({ ...form, phone: event.target.value })}
                required
              />
            </div>

            <div>
              <label className="label" htmlFor="customer-fb">Tên Facebook</label>
              <input
                id="customer-fb"
                className="field"
                value={form.facebookName}
                onChange={(event) => setForm({ ...form, facebookName: event.target.value })}
              />
            </div>

            <div>
              <label className="label" htmlFor="customer-note">Ghi chú</label>
              <textarea
                id="customer-note"
                className="textarea-field"
                value={form.note}
                onChange={(event) => setForm({ ...form, note: event.target.value })}
              />
            </div>

            <button id="customer-submit" className="primary-btn w-full justify-center">
              <Plus size={16} />
              {editingId ? 'Lưu khách hàng' : 'Thêm khách hàng'}
            </button>
          </div>
        </form>

        {/* Table */}
        <div>
          {/* Search */}
          <div className="relative mb-4">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-dim" />
            <input
              id="customer-search"
              className="field !pl-9"
              type="text"
              placeholder="Tìm theo tên hoặc SĐT..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Mobile card list */}
          <div className="space-y-3 md:hidden">
            {filtered.map((customer) => (
              <div
                key={customer._id}
                className="panel p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glow"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-ocean text-white text-xs font-bold">
                    {customer.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-sm text-ink truncate">{customer.name}</div>
                    <div className="text-xs text-ink-muted">{customer.phone}</div>
                  </div>
                </div>
                {customer.facebookName && (
                  <div className="text-xs text-ink-muted mb-2">
                    <span className="text-ink-dim">Facebook: </span>
                    {customer.facebookName}
                  </div>
                )}
                {customer.note && (
                  <p className="text-xs text-ink-dim mb-3 line-clamp-2">{customer.note}</p>
                )}
                <div className="flex gap-2 border-t border-surface-border pt-3">
                  <button className="secondary-btn flex-1 justify-center !h-8 text-xs" onClick={() => handleEdit(customer)}>
                    <Pencil size={13} />
                    Sửa
                  </button>
                  <button className="danger-btn !h-8 !px-3 text-xs" onClick={() => handleDelete(customer._id)}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="panel p-8 text-center text-ink-dim">
                <div className="text-3xl mb-2">👤</div>
                {customers.length === 0 ? 'Chưa có khách hàng.' : 'Không tìm thấy khách hàng.'}
              </div>
            )}
          </div>

          {/* Desktop table */}
          <div className="table-wrap hidden md:block">
            <table className="min-w-[700px] w-full">
              <thead className="table-head">
                <tr>
                  <th className="px-4 py-3.5">Khách</th>
                  <th className="px-4 py-3.5">Điện thoại</th>
                  <th className="px-4 py-3.5">Facebook</th>
                  <th className="px-4 py-3.5">Ghi chú</th>
                  <th className="px-4 py-3.5">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((customer) => (
                  <tr key={customer._id} className="group transition-colors duration-150 hover:bg-surface-hover/50">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-ocean text-white text-xs font-bold">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-ink">{customer.name}</span>
                      </div>
                    </td>
                    <td className="table-cell">{customer.phone}</td>
                    <td className="table-cell">{customer.facebookName || '-'}</td>
                    <td className="table-cell max-w-xs truncate">{customer.note || '-'}</td>
                    <td className="table-cell">
                      <div className="flex gap-2">
                        <button className="secondary-btn !h-8 !px-3 text-xs" onClick={() => handleEdit(customer)}>
                          <Pencil size={13} />
                        </button>
                        <button className="danger-btn !h-8 !px-3 text-xs" onClick={() => handleDelete(customer._id)}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td className="table-cell text-center text-ink-dim py-12" colSpan="5">
                      <div className="text-3xl mb-2">👤</div>
                      {customers.length === 0 ? 'Chưa có khách hàng.' : 'Không tìm thấy khách hàng.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-3 text-right text-xs text-ink-dim">
            Hiển thị {filtered.length} / {customers.length} khách hàng
          </div>
        </div>
      </div>
    </>
  );
};

export default CustomersPage;
