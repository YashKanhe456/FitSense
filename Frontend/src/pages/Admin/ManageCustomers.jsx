import React, { useEffect, useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import StatePanel from '../../components/StatePanel';
import { apiServices } from '../../services/api';
import { formatCurrency } from '../../utils/storefront';

function ManageCustomers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const loadCustomers = async ({ silent = false } = {}) => {
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const { data } = await apiServices.getUsers({ role: 'customer' });
      setCustomers(data.data || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load customers.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return customers;
    }

    return customers.filter((customer) =>
      [customer.name, customer.email].filter(Boolean).some((value) => value.toLowerCase().includes(normalizedSearch))
    );
  }, [customers, search]);

  const summary = useMemo(
    () => ({
      total: customers.length,
      withOrders: customers.filter((customer) => customer.metrics.orders > 0).length,
      repeat: customers.filter((customer) => customer.metrics.orders > 1).length,
      totalSpent: customers.reduce((sum, customer) => sum + customer.metrics.totalSpent, 0)
    }),
    [customers]
  );

  if (loading) {
    return <StatePanel title="Loading customers" description="Collecting registered customer profiles..." />;
  }

  if (error) {
    return <StatePanel title="Could not load customers" description={error} />;
  }

  return (
    <section className="admin-page">
      <div className="section-heading section-heading--wide">
        <p className="section-kicker">Customers</p>
        <h1>Track account growth and customer value</h1>
        <p>See who has registered, how often they order, and how much they have spent.</p>
      </div>

      <div className="admin-toolbar">
        <input
          type="search"
          placeholder="Search by customer name or email…"
          aria-label="Search customers"
          autoComplete="off"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <button type="button" className="ghost-button" onClick={() => loadCustomers({ silent: true })} disabled={refreshing}>
          <RefreshCw size={16} className={refreshing ? 'spin' : ''} />
          {refreshing ? 'Refreshing' : 'Refresh'}
        </button>
      </div>

      <div className="admin-mini-stats">
        <div><strong>{summary.total}</strong><span>Total customers</span></div>
        <div><strong>{summary.withOrders}</strong><span>With orders</span></div>
        <div><strong>{summary.repeat}</strong><span>Repeat buyers</span></div>
        <div><strong>{formatCurrency(summary.totalSpent)}</strong><span>Lifetime sales</span></div>
      </div>

      {filteredCustomers.length === 0 ? (
        <StatePanel title="No matching customers" description="Try a different search term." />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Joined</th>
                <th>Orders</th>
                <th>Total spent</th>
                <th>Last order</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer._id}>
                  <td>
                    <strong>{customer.name}</strong>
                    <p>{customer.email}</p>
                  </td>
                  <td>{new Date(customer.createdAt).toLocaleDateString('en-IN')}</td>
                  <td>{customer.metrics.orders}</td>
                  <td>{formatCurrency(customer.metrics.totalSpent)}</td>
                  <td>{customer.metrics.lastOrderAt ? new Date(customer.metrics.lastOrderAt).toLocaleDateString('en-IN') : 'No orders yet'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default ManageCustomers;
