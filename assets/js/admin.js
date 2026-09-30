(function () {
'use strict';

      const adminState = { submissions: [], eventRegistrations: [], volunteers: [], messages: [], donations: [], content: [], users: [] };
      function escapeHtml(value) { return String(value ?? '').replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character])); }
      function formatDate(value) { if (!value) return '—'; return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value)); }
      function statusBadge(status) { const normalized = String(status || 'pending').toLowerCase(); return `<span class="admin-badge admin-badge-${escapeHtml(normalized)}">${escapeHtml(normalized)}</span>`; }
      function emptyRow(message, columns) { return `<tr><td colspan="${columns}"><div class="admin-table-empty"><span class="admin-empty-icon">⌁</span><strong>${escapeHtml(message)}</strong><span>New activity will appear here.</span></div></td></tr>`; }
      function renderStats() { document.getElementById('statSubmissions').textContent = adminState.submissions.length; document.getElementById('statVolunteers').textContent = adminState.volunteers.length; document.getElementById('statDonations').textContent = adminState.donations.length; document.getElementById('statMessages').textContent = adminState.messages.length; }
        function renderSubmissions() {
          const rows = adminState.submissions.map(item => `<tr data-searchable="${escapeHtml(`${item.name} ${item.email} ${item.interest}`)}"><td><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.county || 'TNCC community')}</small></td><td><span class="admin-table-primary">${escapeHtml(item.email)}</span><small>${escapeHtml(item.phone || 'No phone')}</small></td><td>${escapeHtml(item.interest || 'Community participation')}</td><td><select class="admin-status-select" data-submission-status="${escapeHtml(item.id)}" aria-label="Update status for ${escapeHtml(item.name)}"><option value="pending" ${item.status === 'pending' ? 'selected' : ''}>Pending</option><option value="approved" ${item.status === 'approved' ? 'selected' : ''}>Approved</option><option value="rejected" ${item.status === 'rejected' ? 'selected' : ''}>Rejected</option></select></td><td>${formatDate(item.created_at)}</td><td><button class="admin-icon-button" type="button" data-submission-delete="${escapeHtml(item.id)}" title="Delete submission"><span aria-hidden="true">🗑</span></button></td></tr>`).join('');
          document.getElementById('submissionsTable').innerHTML = rows || emptyRow('No submissions yet', 6);
          document.getElementById('recentSubmissions').innerHTML = adminState.submissions.slice(0, 5).map(item => `<tr><td><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.email)}</small></td><td>${escapeHtml(item.interest || 'Community participation')}</td><td>${statusBadge(item.status)}</td><td>${formatDate(item.created_at)}</td></tr>`).join('') || emptyRow('No recent submissions', 4);
        }
        function renderEventRegistrations() {
          const rows = adminState.eventRegistrations.map(item => `<tr data-searchable="${escapeHtml(`${item.name} ${item.email} ${item.selected_category || ''} ${item.gender || ''} ${item.bib_number || ''}`)}" data-payment="${escapeHtml(item.payment_status || '')}" data-category="${escapeHtml(item.selected_category || '')}"><td><strong>${escapeHtml(item.name || 'Unnamed participant')}</strong><small>Bib #${escapeHtml(item.bib_number || '—')}</small></td><td><span class="admin-table-primary">${escapeHtml(item.email)}</span><small>Age ${escapeHtml(item.age || '—')} · ${escapeHtml(item.phone || 'No phone')}${item.gender ? ' · ' + escapeHtml(item.gender) : ''}</small></td><td>${escapeHtml(item.selected_category || '—')}<small>${escapeHtml(item.race_distance || '')}</small></td><td><span class="admin-badge ${item.payment_status === 'paid' ? 'admin-badge-paid' : item.payment_status === 'completed' ? 'admin-badge-approved' : 'admin-badge-pending'}">${escapeHtml(item.payment_status || 'pending')}</span><small>M-Pesa ref: ${escapeHtml(item.mpesa_reference || '—')}</small></td><td>${statusBadge(item.status)}</td><td>${formatDate(item.created_at)}</td><td><select class="admin-status-select" data-event-status="${escapeHtml(item.id)}" aria-label="Update status for ${escapeHtml(item.name || 'participant')}" style="min-width:120px"><option value="pending" ${item.status === 'pending' ? 'selected' : ''}>Pending</option><option value="approved" ${item.status === 'approved' ? 'selected' : ''}>Approved</option><option value="rejected" ${item.status === 'rejected' ? 'selected' : ''}>Rejected</option></select></td></tr>`).join('');
          document.getElementById('eventRegistrationsTable').innerHTML = rows || emptyRow('No event registrations yet', 7);
        }
        function applyEventFilters() {
          const categoryFilter = document.querySelector('[data-event-filter="category"]')?.value || '';
          const paymentFilter = document.querySelector('[data-event-filter="payment"]')?.value || '';
          const search = (document.querySelector('[data-table-search="event-registrations"]')?.value || '').toLowerCase();
          document.querySelectorAll('#eventRegistrationsTable tr[data-searchable]').forEach(row => {
            let visible = true;
            if (search && !row.dataset.searchable.toLowerCase().includes(search)) visible = false;
            if (categoryFilter && row.dataset.category !== categoryFilter) visible = false;
            if (paymentFilter && row.dataset.payment !== paymentFilter) visible = false;
            row.hidden = !visible;
          });
        }
        function populateCategoryFilter() {
          const select = document.querySelector('[data-event-filter="category"]');
          if (!select) return;
          const categories = [...new Set(adminState.eventRegistrations.map(item => item.selected_category).filter(Boolean))].sort();
          select.innerHTML = '<option value="">All categories</option>' + categories.map(cat => `<option value="${escapeHtml(cat)}">${escapeHtml(cat)}</option>`).join('');
        }
       function filterEventRegistrations(query) { document.querySelectorAll('#eventRegistrationsTable tr[data-searchable]').forEach(row => { row.hidden = query && !row.dataset.searchable.toLowerCase().includes(query.toLowerCase()); }); }
        function exportEventRegistrationsCsv() {
          const headers = ['Participant Name','Age','Gender','County','Sub-county','Ward','Guardian','Guardian Phone','Race Category','Distance','Fee','Payment Status','M-Pesa Reference','Registration Status','Registration Date'];
          const searchQuery = document.querySelector('[data-table-search="event-registrations"]')?.value.toLowerCase() || '';
          const visibleItems = adminState.eventRegistrations.filter(item => {
            if (!searchQuery) return true;
            const searchable = `${item.name || ''} ${item.email || ''} ${item.selected_category || ''} ${item.gender || ''}`.toLowerCase();
            return searchable.includes(searchQuery);
          });
          const rows = visibleItems.map(item => [
            item.name || '',
            item.age || '',
            item.gender || '',
            item.county || '',
            item.sub_county || '',
            item.ward || '',
            item.guardian || '',
            item.guardian_phone || '',
            item.selected_category || '',
            item.race_distance || '',
            item.registration_fee || 0,
            item.payment_status || '',
            item.mpesa_reference || '',
            item.status || '',
            item.created_at ? new Date(item.created_at).toLocaleDateString('en-GB') : ''
          ].map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','));
          const csvContent = [headers.join(','), ...rows].join('\n');
          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `tncc-teso-north-cross-country-registrations-${new Date().toISOString().slice(0,10)}.csv`;
          a.click();
          URL.revokeObjectURL(url);
        }
        function exportEventRegistrationsPdf() {
          const searchQuery = document.querySelector('[data-table-search="event-registrations"]')?.value.toLowerCase() || '';
          const categoryFilter = document.querySelector('[data-event-filter="category"]')?.value || '';
          const paymentFilter = document.querySelector('[data-event-filter="payment"]')?.value || '';
          const visibleItems = adminState.eventRegistrations.filter(item => {
            if (searchQuery) {
              const searchable = `${item.name || ''} ${item.email || ''} ${item.selected_category || ''} ${item.gender || ''}`.toLowerCase();
              if (!searchable.includes(searchQuery)) return false;
            }
            if (categoryFilter && (item.selected_category || '') !== categoryFilter) return false;
            if (paymentFilter && (item.payment_status || '') !== paymentFilter) return false;
            return true;
          });
          if (!visibleItems.length) { showToast('No registrations to export for the current filters.', 'error'); return; }
          const windowName = window.open('', '_blank');
          const rows = visibleItems.map(item => `<tr><td>${escapeHtml(item.name || '')}</td><td>${escapeHtml(item.age || '')}</td><td>${escapeHtml(item.gender || '')}</td><td>${escapeHtml(item.county || '')}</td><td>${escapeHtml(item.selected_category || '')}</td><td>${escapeHtml(item.race_distance || '')}</td><td>${escapeHtml(item.payment_status || '')}</td><td>${escapeHtml(item.mpesa_reference || '')}</td><td>${escapeHtml(item.status || '')}</td><td>${escapeHtml(item.created_at ? new Date(item.created_at).toLocaleDateString('en-GB') : '')}</td></tr>`).join('');
          windowName.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>TNCC Event Registrations</title><style>body{font-family:Arial,sans-serif;margin:20px;}h1{font-size:18px;}table{border-collapse:collapse;width:100%;}th,td{border:1px solid #ddd;padding:6px;text-align:left;font-size:11px;}th{background:#f4f4f4;}@media print{body{margin:0;}}</style></head><body><h1>Teso North Cross Country - Registrations</h1><p>Exported on ${new Date().toLocaleString()}</p><p>Total: ${visibleItems.length} registrations</p><table><thead><tr><th>Participant</th><th>Age</th><th>Gender</th><th>County</th><th>Category</th><th>Distance</th><th>Payment</th><th>M-Pesa Ref</th><th>Status</th><th>Date</th></tr></thead><tbody>${rows}</tbody></table></body></html>`);
          windowName.document.close();
          windowName.focus();
          windowName.print();
        }
        function printEventRegistrationsTable() {
          const printContents = document.getElementById('event-registrations').innerHTML;
          const popupWin = window.open('', '_blank');
          popupWin.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>TNCC Registrations</title><style>body{font-family:Arial,sans-serif;margin:20px;}table{border-collapse:collapse;width:100%;}th,td{border:1px solid #ddd;padding:6px;font-size:11px;}</style></head><body>${printContents}</body></html>`);
          popupWin.document.close();
          popupWin.focus();
          popupWin.print();
        }
        async function deleteVolunteer(id) {
          if (!confirm('Delete this volunteer application? This cannot be undone.')) return;
          try {
            await callAdminEdge('deleteVolunteer', { id });
            adminState.volunteers = adminState.volunteers.filter(item => String(item.id) !== String(id));
            renderVolunteers();
            showToast('Volunteer application deleted.', 'success');
          } catch (error) { showToast(error.message, 'error'); }
        }
        async function deleteMessage(id) {
          if (!confirm('Delete this message? This cannot be undone.')) return;
          try {
            await callAdminEdge('deleteContactMessage', { id });
            adminState.messages = adminState.messages.filter(item => String(item.id) !== String(id));
            renderMessages();
            showToast('Message deleted.', 'success');
          } catch (error) { showToast(error.message, 'error'); }
        }
        async function deleteDonation(id) {
          if (!confirm('Delete this donation record? This cannot be undone.')) return;
          try {
            await callAdminEdge('deleteDonation', { id });
            adminState.donations = adminState.donations.filter(item => String(item.id) !== String(id));
            renderDonations();
            showToast('Donation record deleted.', 'success');
          } catch (error) { showToast(error.message, 'error'); }
        }
        async function deleteSubmission(id) {
          if (!confirm('Delete this submission? This cannot be undone.')) return;
          try {
            await callAdminEdge('deleteSubmission', { id });
            adminState.submissions = adminState.submissions.filter(item => String(item.id) !== String(id));
            renderSubmissions(); showToast('Submission deleted.', 'success');
          } catch (error) { showToast(error.message, 'error'); }
        }
        function exportVolunteersPdf() {
          const windowName = window.open('', '_blank');
          const rows = adminState.volunteers.map(item => `<tr><td>${escapeHtml(item.name || '')}</td><td>${escapeHtml(item.role || '')}</td><td>${escapeHtml(item.email || '')}</td><td>${escapeHtml(item.phone || '')}</td><td>${formatDate(item.created_at)}</td></tr>`).join('');
          windowName.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>TNCC Volunteers</title><style>body{font-family:Arial,sans-serif;margin:20px;}h1{font-size:18px;}table{border-collapse:collapse;width:100%;}th,td{border:1px solid #ddd;padding:6px;text-align:left;font-size:11px;}th{background:#f4f4f4;}</style></head><body><h1>TNCN Volunteers</h1><p>Exported on ${new Date().toLocaleString()}</p><p>Total: ${adminState.volunteers.length} volunteers</p><table><thead><tr><th>Name</th><th>Role</th><th>Email</th><th>Phone</th><th>Received</th></tr></thead><tbody>${rows}</tbody></table></body></html>`);
          windowName.document.close();
          windowName.focus();
          windowName.print();
        }
        function exportDonationsPdf() {
          const windowName = window.open('', '_blank');
          const rows = adminState.donations.map(item => `<tr><td>${escapeHtml(item.donor_name || 'Anonymous donor')}</td><td>KES ${Number(item.amount_kes || 0).toLocaleString()}</td><td>${escapeHtml(item.status || '')}</td><td>${escapeHtml(item.email || '')}</td><td>${formatDate(item.created_at)}</td></tr>`).join('');
          windowName.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>TNCC Donations</title><style>body{font-family:Arial,sans-serif;margin:20px;}h1{font-size:18px;}table{border-collapse:collapse;width:100%;}th,td{border:1px solid #ddd;padding:6px;text-align:left;font-size:11px;}th{background:#f4f4f4;}</style></head><body><h1>TNCC Donations</h1><p>Exported on ${new Date().toLocaleString()}</p><p>Total: ${adminState.donations.length} donations</p><table><thead><tr><th>Donor</th><th>Amount</th><th>Status</th><th>Email</th><th>Received</th></tr></thead><tbody>${rows}</tbody></table></body></html>`);
          windowName.document.close();
          windowName.focus();
          windowName.print();
        }
        function exportMessagesPdf() {
          const windowName = window.open('', '_blank');
          const rows = adminState.messages.map(item => `<tr><td>${escapeHtml(item.name || '')}</td><td>${escapeHtml(item.email || '')}</td><td>${escapeHtml(item.message || '').substring(0, 100)}</td><td>${formatDate(item.created_at)}</td></tr>`).join('');
          windowName.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>TNCC Contact Messages</title><style>body{font-family:Arial,sans-serif;margin:20px;}h1{font-size:18px;}table{border-collapse:collapse;width:100%;}th,td{border:1px solid #ddd;padding:6px;text-align:left;font-size:11px;}th{background:#f4f4f4;}</style></head><body><h1>TNCC Contact Messages</h1><p>Exported on ${new Date().toLocaleString()}</p><p>Total: ${adminState.messages.length} messages</p><table><thead><tr><th>Name</th><th>Email</th><th>Message</th><th>Received</th></tr></thead><tbody>${rows}</tbody></table></body></html>`);
          windowName.document.close();
          windowName.focus();
          windowName.print();
        }
        function exportSubmissionsPdf() {
          const windowName = window.open('', '_blank');
          const rows = adminState.submissions.map(item => `<tr><td>${escapeHtml(item.name || '')}</td><td>${escapeHtml(item.email || '')}</td><td>${escapeHtml(item.interest || '')}</td><td>${escapeHtml(item.phone || '')}</td><td>${escapeHtml(item.status || '')}</td><td>${formatDate(item.created_at)}</td></tr>`).join('');
          windowName.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>TNCC Submissions</title><style>body{font-family:Arial,sans-serif;margin:20px;}h1{font-size:18px;}table{border-collapse:collapse;width:100%;}th,td{border:1px solid #ddd;padding:6px;text-align:left;font-size:11px;}th{background:#f4f4f4;}</style></head><body><h1>TNCC Submissions</h1><p>Exported on ${new Date().toLocaleString()}</p><p>Total: ${adminState.submissions.length} submissions</p><table><thead><tr><th>Name</th><th>Email</th><th>Interest</th><th>Phone</th><th>Status</th><th>Received</th></tr></thead><tbody>${rows}</tbody></table></body></html>`);
          windowName.document.close();
          windowName.focus();
          windowName.print();
        }
       function renderVolunteers() {
         document.getElementById('volunteersTable').innerHTML = adminState.volunteers.map(item => `<tr><td><strong>${escapeHtml(item.name)}</strong></td><td>${escapeHtml(item.role)}</td><td><span class="admin-table-primary">${escapeHtml(item.email)}</span><small>${escapeHtml(item.phone || 'No phone number')}</small></td><td>${formatDate(item.created_at)}</td><td><button class="admin-icon-button" type="button" data-volunteer-delete="${escapeHtml(item.id)}" title="Delete volunteer"><span aria-hidden="true">🗑</span></button></td></tr>`).join('') || emptyRow('No volunteer applications yet', 5);
       }
       function renderDonations() {
         document.getElementById('donationsTable').innerHTML = adminState.donations.map(item => `<tr><td><strong>${escapeHtml(item.donor_name || 'Anonymous donor')}</strong><small>${escapeHtml(item.email || 'No email')}</small></td><td class="admin-amount">KES ${Number(item.amount_kes || 0).toLocaleString()}</td><td><select class="admin-status-select" data-donation-status="${escapeHtml(item.id)}" aria-label="Update donation status"><option value="pending" ${item.status === 'pending' ? 'selected' : ''}>Pending</option><option value="paid" ${item.status === 'paid' ? 'selected' : ''}>Paid</option><option value="cancelled" ${item.status === 'cancelled' ? 'selected' : ''}>Cancelled</option></select></td><td>${formatDate(item.created_at)}</td><td><button class="admin-icon-button" type="button" data-donation-delete="${escapeHtml(item.id)}" title="Delete donation"><span aria-hidden="true">🗑</span></button></td></tr>`).join('') || emptyRow('No donations recorded yet', 5);
       }
       function renderMessages() {
         document.getElementById('messagesTable').innerHTML = adminState.messages.map(item => `<tr><td><strong>${escapeHtml(item.name)}</strong></td><td>${escapeHtml(item.email)}</td><td class="admin-message-cell">${escapeHtml(item.message)}</td><td>${formatDate(item.created_at)}</td><td><button class="admin-icon-button" type="button" data-message-delete="${escapeHtml(item.id)}" title="Delete message"><span aria-hidden="true">🗑</span></button></td></tr>`).join('') || emptyRow('No contact messages yet', 5);
       }
      function renderUsers() { document.getElementById('usersTable').innerHTML = adminState.users.map(item => `<tr><td><strong>${escapeHtml(item.full_name || 'Unnamed user')}</strong><small>${escapeHtml(item.email || 'No email')}</small></td><td>${formatDate(item.created_at)}</td><td>${statusBadge(item.role)}</td><td><select class="admin-status-select" data-user-role="${escapeHtml(item.id)}" aria-label="Change role for ${escapeHtml(item.email || item.full_name || 'user')}"><option value="reader" ${item.role === 'reader' ? 'selected' : ''}>Reader</option><option value="admin" ${item.role === 'admin' ? 'selected' : ''}>Admin</option></select></td></tr>`).join('') || emptyRow('No registered users yet', 4); }
      function renderContent() { document.getElementById('contentList').innerHTML = adminState.content.map(item => `<article class="admin-content-card"><div class="admin-content-card-top"><span class="admin-content-category">${escapeHtml(item.category)}</span>${item.published ? '<span class="admin-badge admin-badge-approved">Published</span>' : '<span class="admin-badge admin-badge-pending">Draft</span>'}</div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.excerpt || 'No excerpt added yet.')}</p><div class="admin-content-card-footer"><small>Updated ${formatDate(item.updated_at || item.created_at)}</small><button class="admin-icon-button" type="button" data-content-edit="${escapeHtml(item.id)}" title="Edit story">✎</button><button class="admin-icon-button admin-content-delete" type="button" data-content-delete="${escapeHtml(item.id)}" title="Delete story">🗑</button><label class="admin-switch"><input type="checkbox" data-content-published="${escapeHtml(item.id)}" ${item.published ? 'checked' : ''} /><span></span><b>${item.published ? 'Published' : 'Draft'}</b></label></div></article>`).join('') || '<div class="admin-empty admin-panel"><span class="admin-empty-icon">▣</span><h3>No content items</h3><p>Published stories will appear here when added.</p></div>'; }
      function filterTable(query) { document.querySelectorAll('#submissionsTable tr[data-searchable]').forEach(row => { row.hidden = !row.dataset.searchable.toLowerCase().includes(query.toLowerCase()); }); }
      async function callAdminEdge(action, payload = {}) {
        const client = window.tnccSupabase || (window.TNCC_CONFIG && window.supabase ? window.supabase.createClient(window.TNCC_CONFIG.supabaseUrl, window.TNCC_CONFIG.supabaseAnonKey) : null);
        if (!client) throw new Error('Supabase configuration is required for admin access.');
        const { data: { session } } = await client.auth.getSession(); if (!session) throw new Error('No active session');
        const response = await fetch(`${window.TNCC_CONFIG.supabaseUrl}/functions/v1/admin`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` }, body: JSON.stringify({ action, ...payload }) });
        const result = await response.json().catch(() => ({})); if (!response.ok) throw new Error(result.error || 'Admin request failed'); return result;
      }
      document.addEventListener('DOMContentLoaded', async () => {
        const getClient = () => window.tnccSupabase || (window.TNCC_CONFIG && window.supabase ? window.supabase.createClient(window.TNCC_CONFIG.supabaseUrl, window.TNCC_CONFIG.supabaseAnonKey) : null); const client = getClient();
        if (!client) { showToast('Supabase configuration is required for admin access.', 'error'); window.location.href = 'login.html?reason=config'; return; }
        const { data: { user }, error: userError } = await client.auth.getUser(); if (userError || !user) { window.location.href = 'login.html?reason=session'; return; }
        const { data: profile, error: profileError } = await client.from('profiles').select('role').eq('id', user.id).single(); if (profileError || !profile || profile.role !== 'admin') { window.location.href = 'login.html?reason=not-approved'; return; }
        document.body.classList.remove('admin-auth-pending');
        let editingContentId = null;

         async function loadAdminData() {
           try {
             const [submissions, eventRegistrations, volunteers, messages, donations, users] = await Promise.all([callAdminEdge('getSubmissions'), callAdminEdge('getEventRegistrations'), callAdminEdge('getVolunteers'), callAdminEdge('getContactMessages'), callAdminEdge('getDonations'), callAdminEdge('getUsers')]);
             adminState.submissions = submissions.data || []; adminState.eventRegistrations = eventRegistrations.data || []; adminState.volunteers = volunteers.data || []; adminState.messages = messages.data || []; adminState.donations = donations.data || []; adminState.users = users.data || [];
             const { data: content } = await client.from('content_items').select('*').order('updated_at', { ascending: false }); adminState.content = content || [];
             renderStats(); renderSubmissions(); renderEventRegistrations(); populateCategoryFilter(); renderVolunteers(); renderDonations(); renderMessages(); renderUsers(); renderContent(); document.getElementById('lastUpdated').textContent = `Synced ${new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' }).format(new Date())}`;
            } catch (error) { console.error(error); showToast(error.message || 'Could not load admin data.', 'error'); [{'id':'submissionsTable','cols':6},{'id':'eventRegistrationsTable','cols':7},{'id':'volunteersTable','cols':5},{'id':'donationsTable','cols':5},{'id':'messagesTable','cols':5},{'id':'usersTable','cols':4}].forEach(({id,cols}) => { document.getElementById(id).innerHTML = emptyRow('Could not load this data', cols); }); }
         }

        function openContentForm(item = null) {
          editingContentId = item ? item.id : null;
          document.getElementById('contentModalTitle').textContent = item ? 'Edit story' : 'New story';
          document.getElementById('contentTitle').value = item?.title || '';
          document.getElementById('contentCategory').value = item?.category || 'Community';
          document.getElementById('contentExcerpt').value = item?.excerpt || '';
          document.getElementById('contentBody').value = item?.body || '';
          document.getElementById('contentImage').value = item?.image_url || '';
          document.getElementById('contentPublished').checked = item ? Boolean(item.published) : true;
          document.getElementById('contentModal').hidden = false;
        }

        function closeContentForm() {
          document.getElementById('contentModal').hidden = true;
          editingContentId = null;
        }

        async function saveContentForm() {
          const title = document.getElementById('contentTitle').value.trim();
          if (!title) { showToast('A title is required.', 'error'); return; }
          const payload = {
            title,
            category: document.getElementById('contentCategory').value || 'Community',
            excerpt: document.getElementById('contentExcerpt').value.trim(),
            body: document.getElementById('contentBody').value.trim(),
            image_url: document.getElementById('contentImage').value.trim() || null,
            published: document.getElementById('contentPublished').checked
          };
          const saveButton = document.getElementById('contentSaveBtn');
          saveButton.disabled = true;
          try {
            if (editingContentId) await callAdminEdge('updateContent', { id: editingContentId, ...payload });
            else await callAdminEdge('createContent', payload);
            showToast(editingContentId ? 'Story updated.' : 'Story created.', 'success');
            closeContentForm();
            await loadAdminData();
          } catch (error) { showToast(error.message, 'error'); }
          finally { saveButton.disabled = false; }
        }

        async function deleteContentItem(id) {
          if (!confirm('Delete this story permanently? This cannot be undone.')) return;
          try { await callAdminEdge('deleteContent', { id }); showToast('Story deleted.', 'success'); await loadAdminData(); }
          catch (error) { showToast(error.message, 'error'); }
        }

        await loadAdminData();

        const adminPages = [['Home', 'index.html'], ['About us', 'about.html'], ['Programs', 'programs.html'], ['Impact', 'impact.html'], ['Gallery', 'gallery.html'], ['Stories', 'stories.html'], ['Event page', 'teso-north-cross-country.html'], ['Register', 'register.html'], ['Get involved', 'get-involved.html'], ['Donate', 'donate.html'], ['Contact', 'contact.html']];
        document.getElementById('adminPageLinks').innerHTML = adminPages.map(([label, file]) => `<a class="admin-page-link" href="${file}?edit=1" target="_blank" rel="noopener">${label} ✎</a>`).join('');

        async function loadMediaLibrary() {
          const grid = document.getElementById('mediaGrid');
          try {
            const { data, error } = await client.storage.from('media').list('', { limit: 200, sortBy: { column: 'created_at', order: 'descending' } });
            if (error) throw error;
            const files = (data || []).filter(f => f.id);
            if (!files.length) { grid.innerHTML = '<div class="admin-table-empty"><span class="admin-empty-icon">▤</span><strong>No media yet</strong><span>Upload images, audio or video with the button above.</span></div>'; return; }
            grid.innerHTML = '';
            files.forEach(file => {
              const { data: urlData } = client.storage.from('media').getPublicUrl(file.name);
              const url = urlData.publicUrl;
              const mime = (file.metadata && file.metadata.mimetype) || '';
              const kind = mime.indexOf('audio/') === 0 ? 'audio' : mime.indexOf('video/') === 0 ? 'video' : 'image';
              const card = document.createElement('div');
              card.className = 'admin-media-card';
              if (kind === 'image') { const img = document.createElement('img'); img.src = url; img.loading = 'lazy'; img.alt = file.name; card.appendChild(img); }
              else if (kind === 'audio') { const audio = document.createElement('audio'); audio.controls = true; audio.src = url; card.appendChild(audio); }
              else { const video = document.createElement('video'); video.src = url; video.muted = true; card.appendChild(video); }
              const name = document.createElement('div'); name.className = 'admin-media-name'; name.textContent = file.name; card.appendChild(name);
              const actions = document.createElement('div'); actions.className = 'admin-media-actions';
              const copy = document.createElement('button'); copy.type = 'button'; copy.className = 'admin-icon-button'; copy.textContent = '⧉'; copy.title = 'Copy URL';
              copy.addEventListener('click', async () => { try { await navigator.clipboard.writeText(url); showToast('Media URL copied.', 'success'); } catch (error) { window.prompt('Copy this URL:', url); } });
              const del = document.createElement('button'); del.type = 'button'; del.className = 'admin-icon-button admin-content-delete'; del.textContent = '🗑'; del.title = 'Delete';
              del.addEventListener('click', async () => {
                if (!confirm('Delete this media file? Anything using it will lose it.')) return;
                try { await callAdminEdge('deleteMedia', { path: file.name }); showToast('Media deleted.', 'success'); await loadMediaLibrary(); }
                catch (error) { showToast(error.message, 'error'); }
              });
              actions.appendChild(copy); actions.appendChild(del); card.appendChild(actions);
              grid.appendChild(card);
            });
          } catch (error) { grid.innerHTML = `<div class="admin-table-empty"><strong>${escapeHtml(error.message)}</strong></div>`; }
        }

        document.getElementById('mediaUploadBtn').addEventListener('click', () => document.getElementById('mediaFileInput').click());
        document.getElementById('mediaFileInput').addEventListener('change', async event => {
          const files = Array.from(event.target.files || []);
          if (!files.length) return;
          const btn = document.getElementById('mediaUploadBtn'); btn.disabled = true;
          try {
            for (const file of files) {
              const safe = file.name.replace(/[^a-zA-Z0-9._-]+/g, '-').slice(-80);
              await client.storage.from('media').upload(`${Date.now()}-${safe}`, file, { cacheControl: '3600', upsert: false });
            }
            showToast('Media uploaded.', 'success');
            await loadMediaLibrary();
          } catch (error) { showToast(error.message || 'Upload failed.', 'error'); }
          btn.disabled = false; event.target.value = '';
        });
        loadMediaLibrary();

        document.getElementById('contentAddBtn').addEventListener('click', () => openContentForm());
        document.querySelector('[data-content-close]').addEventListener('click', closeContentForm);
        document.querySelector('[data-content-cancel]').addEventListener('click', closeContentForm);
        document.getElementById('contentModal').addEventListener('click', event => { if (event.target.id === 'contentModal') closeContentForm(); });
        document.getElementById('contentSaveBtn').addEventListener('click', saveContentForm);
        document.addEventListener('click', async event => {
          const editButton = event.target.closest('[data-content-edit]');
          if (editButton) { const item = adminState.content.find(entry => String(entry.id) === String(editButton.dataset.contentEdit)); if (item) openContentForm(item); return; }
          const deleteButton = event.target.closest('[data-content-delete]');
          if (deleteButton) { deleteContentItem(deleteButton.dataset.contentDelete); return; }
        });

        document.getElementById('logoutBtn').addEventListener('click', async () => { await client.auth.signOut(); window.location.href = 'login.html'; }); document.getElementById('sidebarLogout').addEventListener('click', async event => { event.preventDefault(); await client.auth.signOut(); window.location.href = 'login.html'; });
         document.querySelector('[data-table-search="submissions"]').addEventListener('input', event => filterTable(event.target.value));
         document.querySelector('[data-table-search="event-registrations"]')?.addEventListener('input', applyEventFilters);
         document.querySelector('[data-event-filter="category"]')?.addEventListener('change', applyEventFilters);
         document.querySelector('[data-event-filter="payment"]')?.addEventListener('change', applyEventFilters);
          document.getElementById('exportPdfBtn')?.addEventListener('click', exportEventRegistrationsPdf);
          document.getElementById('exportCsvBtn')?.addEventListener('click', exportEventRegistrationsCsv);
          document.getElementById('printRegistrationsBtn')?.addEventListener('click', printEventRegistrationsTable);
          document.getElementById('exportSubmissionsPdfBtn')?.addEventListener('click', exportSubmissionsPdf);
          document.getElementById('exportVolunteersPdfBtn')?.addEventListener('click', exportVolunteersPdf);
          document.getElementById('exportDonationsPdfBtn')?.addEventListener('click', exportDonationsPdf);
          document.getElementById('exportMessagesPdfBtn')?.addEventListener('click', exportMessagesPdf);
          document.getElementById('assignBibBtn')?.addEventListener('click', async () => {
           const btn = document.getElementById('assignBibBtn'); btn.disabled = true; btn.textContent = 'Assigning…';
           try {
             const result = await callAdminEdge('assignBibNumbers');
             if (result && result.data) { showToast(`${result.data.length} bib numbers assigned.`, 'success'); }
             else { showToast('No new bib numbers to assign.', 'info'); }
             await loadAdminData();
           } catch (error) { showToast(error.message || 'Could not assign bib numbers.', 'error'); }
           finally { btn.disabled = false; btn.innerHTML = '<span aria-hidden="true">#</span> Assign bib numbers'; }
         });
          document.addEventListener('change', async event => {
            if (event.target.matches('[data-submission-status]')) { const select = event.target; select.disabled = true; try { await callAdminEdge('updateSubmissionStatus', { id: select.dataset.submissionStatus, status: select.value }); const item = adminState.submissions.find(entry => String(entry.id) === String(select.dataset.submissionStatus)); if (item) item.status = select.value; renderSubmissions(); showToast('Submission status updated.', 'success'); } catch (error) { showToast(error.message, 'error'); renderSubmissions(); } finally { select.disabled = false; } }
            if (event.target.matches('[data-event-status]')) { const select = event.target; select.disabled = true; try { await callAdminEdge('updateEventRegistration', { id: select.dataset.eventStatus, status: select.value }); const item = adminState.eventRegistrations.find(entry => String(entry.id) === String(select.dataset.eventStatus)); if (item) item.status = select.value; renderEventRegistrations(); showToast('Registration status updated.', 'success'); } catch (error) { showToast(error.message, 'error'); renderEventRegistrations(); } finally { select.disabled = false; } }
           if (event.target.matches('[data-content-published]')) { const checkbox = event.target; checkbox.disabled = true; try { await callAdminEdge('setContentItemPublished', { id: checkbox.dataset.contentPublished, published: checkbox.checked }); const item = adminState.content.find(entry => String(entry.id) === String(checkbox.dataset.contentPublished)); if (item) item.published = checkbox.checked; renderContent(); showToast('Content visibility updated.', 'success'); } catch (error) { checkbox.checked = !checkbox.checked; showToast(error.message, 'error'); } finally { checkbox.disabled = false; } }
           if (event.target.matches('[data-user-role]')) { const select = event.target; const previousRole = adminState.users.find(item => String(item.id) === String(select.dataset.userRole))?.role; select.disabled = true; try { await callAdminEdge('updateUserRole', { id: select.dataset.userRole, role: select.value }); const item = adminState.users.find(entry => String(entry.id) === String(select.dataset.userRole)); if (item) item.role = select.value; renderUsers(); showToast('User access updated.', 'success'); } catch (error) { select.value = previousRole || 'reader'; showToast(error.message, 'error'); } finally { select.disabled = false; } }
           if (event.target.matches('[data-donation-status]')) { const select = event.target; select.disabled = true; try { await callAdminEdge('updateDonation', { id: select.dataset.donationStatus, status: select.value }); const item = adminState.donations.find(entry => String(entry.id) === String(select.dataset.donationStatus)); if (item) item.status = select.value; renderDonations(); showToast('Donation status updated.', 'success'); } catch (error) { showToast(error.message, 'error'); renderDonations(); } finally { select.disabled = false; } }
         });
         document.addEventListener('click', async event => {
            const volunteerDelete = event.target.closest('[data-volunteer-delete]');
            if (volunteerDelete) { await deleteVolunteer(volunteerDelete.dataset.volunteerDelete); return; }
            const messageDelete = event.target.closest('[data-message-delete]');
            if (messageDelete) { await deleteMessage(messageDelete.dataset.messageDelete); return; }
            const donationDelete = event.target.closest('[data-donation-delete]');
            if (donationDelete) { await deleteDonation(donationDelete.dataset.donationDelete); return; }
            const submissionDelete = event.target.closest('[data-submission-delete]');
            if (submissionDelete) { await deleteSubmission(submissionDelete.dataset.submissionDelete); return; }
         });
        document.querySelectorAll('[data-admin-nav]').forEach(link => link.addEventListener('click', () => document.body.classList.remove('admin-menu-open'))); document.querySelector('[data-admin-menu-open]').addEventListener('click', () => document.body.classList.add('admin-menu-open')); document.querySelectorAll('[data-admin-menu-close]').forEach(button => button.addEventListener('click', () => document.body.classList.remove('admin-menu-open')));
      });

})();

