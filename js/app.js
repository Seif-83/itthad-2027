/**
 * اتحاد طلاب كلية الحاسبات وعلوم البيانات 2027
 * المنظومة التفاعلية لإدارة وتوزيع اللجان والأعضاء
 * رئيس الاتحاد: سيف عمرو | نائب الرئيس: علي تيتو
 */

// Application State
let appState = {
    members: [],
    committees: DEFAULT_COMMITTEES,
    currentUser: 'president', // 'president' (سيف عمرو) or 'vicePresident' (علي تيتو)
    currentTheme: 'dark',
    currentView: 'committees', // 'committees', 'table', 'hierarchy'
    searchQuery: '',
    filterCommittee: 'all',
    filterRole: 'all',
    editingMemberId: null
};

// ==========================================================================
// Initialization & LocalStorage
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

const SCHEMA_VERSION = 'cds_union_v5_clean_zero';

function initApp() {
    // 1. Load Theme
    const savedTheme = localStorage.getItem('cds_union_theme') || 'dark';
    setTheme(savedTheme);

    // 2. Load Active Executive User
    const savedUser = localStorage.getItem('cds_union_current_user') || 'president';
    setExecutiveUser(savedUser, false);

    // 3. Load Members Data (Zero out old demo data as requested by Seif Amr)
    const savedSchema = localStorage.getItem('cds_union_schema_version');
    if (savedSchema !== SCHEMA_VERSION) {
        // First load with new clean state: start strictly at 0 members
        appState.members = [];
        localStorage.setItem('cds_union_schema_version', SCHEMA_VERSION);
        saveMembersToStorage();
    } else {
        const savedMembers = localStorage.getItem('cds_union_members');
        if (savedMembers) {
            try {
                appState.members = JSON.parse(savedMembers);
            } catch (e) {
                appState.members = [];
            }
        } else {
            appState.members = [];
            saveMembersToStorage();
        }
    }

    // 4. Render Interface
    renderApp();
}

function saveMembersToStorage() {
    localStorage.setItem('cds_union_members', JSON.stringify(appState.members));
}

// ==========================================================================
// Sound Synthesis (Web Audio API - Subtle Feedback)
// ==========================================================================
function playAudioFeedback(type = 'success') {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        if (type === 'success') {
            osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
            osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.12); // A5
            gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.2);
        } else if (type === 'delete') {
            osc.frequency.setValueAtTime(320, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(180, audioCtx.currentTime + 0.15);
            gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.2);
        }
    } catch (e) {
        // AudioContext not allowed or unavailable; silent fallback
    }
}

// ==========================================================================
// Executive Profile Switcher (سيف عمرو & علي تيتو)
// ==========================================================================
function setExecutiveUser(userKey, notify = true) {
    appState.currentUser = userKey;
    localStorage.setItem('cds_union_current_user', userKey);

    const btnPresident = document.getElementById('btnSwitchPresident');
    const btnVice = document.getElementById('btnSwitchVice');
    const avatarElem = document.getElementById('currentExecAvatar');
    const nameElem = document.getElementById('currentExecName');
    const roleBadge = document.getElementById('currentExecRoleBadge');
    const quoteElem = document.getElementById('currentExecQuote');

    if (userKey === 'president') {
        btnPresident.classList.add('active');
        btnVice.classList.remove('active');
        avatarElem.innerText = 'س';
        avatarElem.style.background = 'var(--grad-gold)';
        nameElem.innerText = 'سيف عمرو';
        roleBadge.className = 'exec-tag tag-president';
        roleBadge.innerText = 'رئيس اتحاد الطلاب';
        quoteElem.innerText = 'يا سيف، المنصة جاهزة لتسكين الـ 8 أفراد في كل لجنة مع الأمين والأمين المساعد!';
        if (notify) showToast('مرحباً بك يا سيف عمرو (رئيس الاتحاد)', 'success');
    } else {
        btnVice.classList.add('active');
        btnPresident.classList.remove('active');
        avatarElem.innerText = 'ع';
        avatarElem.style.background = 'var(--grad-primary)';
        nameElem.innerText = 'علي تيتو';
        roleBadge.className = 'exec-tag tag-vice';
        roleBadge.innerText = 'نائب رئيس اتحاد الطلاب';
        quoteElem.innerText = 'يا تيتو، كل الصلاحيات مفعلة لإضافة وتعديل ومتابعة أعضاء ولجان الاتحاد!';
        if (notify) showToast('مرحباً بك يا علي تيتو (نائب رئيس الاتحاد)', 'success');
    }
}

function getExecutiveName() {
    return appState.currentUser === 'president' ? 'سيف عمرو' : 'علي تيتو';
}

// ==========================================================================
// Theme Toggle
// ==========================================================================
function setTheme(theme) {
    appState.currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('cds_union_theme', theme);

    const icon = document.getElementById('themeIcon');
    if (theme === 'light') {
        icon.className = 'fa-solid fa-sun';
        icon.style.color = '#f59e0b';
    } else {
        icon.className = 'fa-solid fa-moon';
        icon.style.color = '';
    }
}

function toggleTheme() {
    const nextTheme = appState.currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    showToast(nextTheme === 'dark' ? 'تم التبديل للوضع الليلي' : 'تم التبديل للوضع النهاري');
}

// ==========================================================================
// View Switcher (Committees Grid / Master Table / Hierarchy)
// ==========================================================================
function switchView(viewMode) {
    appState.currentView = viewMode;

    const views = {
        committees: document.getElementById('viewCommittees'),
        table: document.getElementById('viewTable'),
        hierarchy: document.getElementById('viewHierarchy')
    };

    const tabs = {
        committees: document.getElementById('tabCommittees'),
        table: document.getElementById('tabTable'),
        hierarchy: document.getElementById('tabHierarchy')
    };

    // Toggle View visibility
    Object.keys(views).forEach(v => {
        if (v === viewMode) {
            views[v].style.display = (v === 'committees') ? 'grid' : 'block';
            tabs[v].classList.add('active');
        } else {
            views[v].style.display = 'none';
            tabs[v].classList.remove('active');
        }
    });

    renderCurrentView();
}

// ==========================================================================
// KPI & Statistics Dashboard
// ==========================================================================
function updateStatistics() {
    const totalMembers = appState.members.length;
    const maxCapacity = 70; // 7 committees * 10 (1 head + 1 vice + 8 members)

    // Heads count (أمناء وأمناء مساعدين)
    const heads = appState.members.filter(m => m.role === 'head' || m.role === 'vice_head');
    const headsCount = heads.length;

    // Remaining slots
    const remainingSlots = Math.max(0, maxCapacity - totalMembers);

    // Completed committees count (has head + vice_head + 8 members = 10)
    let completedCommittees = 0;
    appState.committees.forEach(comm => {
        const commMembers = appState.members.filter(m => m.committeeId === comm.id);
        const hasHead = commMembers.some(m => m.role === 'head');
        const hasVice = commMembers.some(m => m.role === 'vice_head');
        const regularMembersCount = commMembers.filter(m => m.role === 'member').length;
        if (hasHead && hasVice && regularMembersCount >= comm.maxMembers) {
            completedCommittees++;
        }
    });

    const completionRate = Math.round((totalMembers / maxCapacity) * 100);

    // DOM Elements update
    document.getElementById('statTotalMembers').innerText = totalMembers;
    document.getElementById('statHeadsCount').innerText = `${headsCount} / 14`;
    document.getElementById('statCompletionRate').innerText = `${completionRate}%`;
    document.getElementById('statCompletedCommitteesCount').innerText = `${completedCommittees} من 7 لجان مكتملة بالكامل`;
    document.getElementById('statRemainingSlots').innerText = remainingSlots;
}

// ==========================================================================
// Render Logic
// ==========================================================================
function renderApp() {
    updateStatistics();
    renderCurrentView();
}

function renderCurrentView() {
    if (appState.currentView === 'committees') {
        renderCommitteesView();
    } else if (appState.currentView === 'table') {
        renderMasterTableView();
    } else if (appState.currentView === 'hierarchy') {
        renderHierarchyView();
    }
}

// Helper: Filter members based on search and dropdowns
function getFilteredMembers() {
    return appState.members.filter(member => {
        // Committee Filter
        if (appState.filterCommittee !== 'all' && member.committeeId !== appState.filterCommittee) {
            return false;
        }

        // Role Filter
        if (appState.filterRole !== 'all' && member.role !== appState.filterRole) {
            return false;
        }

        // Search Query
        if (appState.searchQuery.trim() !== '') {
            const q = appState.searchQuery.trim().toLowerCase();
            const nameMatch = (member.name || '').toLowerCase().includes(q);
            const phoneMatch = (member.phone || '').toLowerCase().includes(q);
            const codeMatch = (member.studentCode || '').toLowerCase().includes(q);
            const skillsMatch = (member.skills || '').toLowerCase().includes(q);
            const deptMatch = (member.department || '').toLowerCase().includes(q);
            if (!nameMatch && !phoneMatch && !codeMatch && !skillsMatch && !deptMatch) {
                return false;
            }
        }

        return true;
    });
}

// ==========================================================================
// 1. Committees Cards Grid View
// ==========================================================================
function renderCommitteesView() {
    const container = document.getElementById('viewCommittees');
    container.innerHTML = '';

    const filtered = getFilteredMembers();

    appState.committees.forEach(comm => {
        // If a specific committee is filtered in dropdown and it's not this one, skip
        if (appState.filterCommittee !== 'all' && appState.filterCommittee !== comm.id) {
            return;
        }

        // All members in this committee from total database
        const commAllMembers = appState.members.filter(m => m.committeeId === comm.id);
        
        // Split roles
        const head = commAllMembers.find(m => m.role === 'head');
        const viceHead = commAllMembers.find(m => m.role === 'vice_head');
        const regularMembers = commAllMembers.filter(m => m.role === 'member');

        const regularCount = regularMembers.length;
        const maxRegular = comm.maxMembers; // 8 أفراد
        const isFull = regularCount >= maxRegular;
        const progressPercent = Math.min(100, Math.round((regularCount / maxRegular) * 100));

        // Create Card Element
        const card = document.createElement('div');
        card.className = 'committee-card';
        card.style.setProperty('--comm-accent', comm.color);

        card.innerHTML = `
            <!-- Header -->
            <div class="comm-card-header">
                <div class="comm-title-row">
                    <div class="comm-title-group">
                        <div class="comm-icon-box" style="background: ${comm.colorGradient};">
                            <i class="${comm.icon}"></i>
                        </div>
                        <div>
                            <h3>${comm.name}</h3>
                            <div class="comm-desc">${comm.description}</div>
                        </div>
                    </div>
                    <div class="comm-capacity-pill ${isFull ? 'full' : ''}">
                        <i class="fa-solid fa-users"></i>
                        <span>${regularCount} / ${maxRegular} أعضاء</span>
                    </div>
                </div>

                <!-- Progress Bar -->
                <div class="comm-progress-bar-container">
                    <div class="comm-progress-labels">
                        <span>نسبة تسكين الأعضاء الـ 8</span>
                        <span>${progressPercent}%</span>
                    </div>
                    <div class="comm-progress-track">
                        <div class="comm-progress-fill" style="width: ${progressPercent}%; background: ${comm.colorGradient};"></div>
                    </div>
                </div>
            </div>

            <!-- Leadership (أمين وأمين مساعد) -->
            <div class="comm-leaders-section">
                <!-- Head -->
                ${renderLeaderSlot(head, comm.id, 'head', 'أمين اللجنة')}
                <!-- Vice Head -->
                ${renderLeaderSlot(viceHead, comm.id, 'vice_head', 'أمين مساعد اللجنة')}
            </div>

            <!-- Regular Members Section (8 أفراد) -->
            <div class="comm-members-section">
                <div class="members-section-header">
                    <span class="members-section-title">
                        <i class="fa-solid fa-user-group" style="color: ${comm.color};"></i>
                        أعضاء اللجنة (${regularCount} من ${maxRegular})
                    </span>
                    ${isFull ? `
                        <span style="font-size: 0.75rem; color: var(--accent-emerald); font-weight: 700;">
                            <i class="fa-solid fa-circle-check"></i> مقاعد مكتملة
                        </span>
                    ` : `
                        <span style="font-size: 0.75rem; color: var(--text-muted);">
                            متبقي ${maxRegular - regularCount} مقاعد
                        </span>
                    `}
                </div>

                <div class="members-list">
                    ${regularMembers.length > 0 ? 
                        regularMembers.map(m => renderMemberItem(m, comm)).join('') : 
                        `
                        <div class="empty-comm-placeholder">
                            <i class="fa-solid fa-user-plus"></i>
                            <p>لا يوجد أعضاء مسجلين حتى الآن</p>
                            <span>المقاعد الـ 8 شاغرة ومتاحة للتسكين</span>
                        </div>
                        `
                    }
                    
                    ${regularCount < maxRegular ? `
                        <button class="btn-add-member-slot ${regularCount === 0 ? 'highlight' : ''}" onclick="openAddMemberModal('${comm.id}', 'member')">
                            <i class="fa-solid fa-plus"></i>
                            <span>${regularCount === 0 ? 'تسكين أول عضو في اللجنة (المقعد 1 من 8)' : `إضافة عضو جديد (${regularCount + 1} من ${maxRegular})`}</span>
                        </button>
                    ` : ''}
                </div>
            </div>
        `;

        container.appendChild(card);
    });

    if (container.children.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
                <i class="fa-solid fa-filter-circle-xmark" style="font-size: 3rem; margin-bottom: 1rem; color: var(--accent-cyan); opacity: 0.5;"></i>
                <h3>لا توجد نتائج مطابقة لبحثك في اللجان</h3>
                <p style="margin-top: 0.5rem;">جرب تغيير كلمة البحث أو إعادة تعيين الفلاتر</p>
                <button class="btn-secondary" style="margin: 1.5rem auto 0;" onclick="resetFilters()">إعادة ضبط الفلاتر</button>
            </div>
        `;
    }
}

// Render Leader Slot (Head or Vice Head)
function renderLeaderSlot(leader, commId, role, roleTitle) {
    if (leader) {
        const isHead = role === 'head';
        return `
            <div class="leader-badge-card ${isHead ? 'role-head' : 'role-vice-head'}">
                <div class="leader-info" onclick="viewMemberProfile('${leader.id}')" style="cursor: pointer;">
                    <div class="leader-role-icon">
                        <i class="${isHead ? 'fa-solid fa-crown' : 'fa-solid fa-star'}"></i>
                    </div>
                    <div class="leader-details">
                        <div class="leader-name" title="${escapeHtml(leader.name)}">${escapeHtml(leader.name)}</div>
                        <div class="leader-role-label">${roleTitle} • ${escapeHtml(leader.year || '')}</div>
                    </div>
                </div>
                <div class="leader-actions">
                    <button class="btn-mini-action" title="عرض التفاصيل" onclick="viewMemberProfile('${leader.id}')">
                        <i class="fa-solid fa-eye"></i>
                    </button>
                    <button class="btn-mini-action" title="تعديل" onclick="openEditMemberModal('${leader.id}')">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button class="btn-mini-action danger" title="حذف" onclick="confirmDeleteMember('${leader.id}')">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </div>
        `;
    } else {
        const isHead = role === 'head';
        return `
            <button class="empty-leader-slot" onclick="openAddMemberModal('${commId}', '${role}')">
                <span>
                    <i class="${isHead ? 'fa-solid fa-crown' : 'fa-solid fa-star'}" style="margin-left: 0.5rem; color: ${isHead ? 'var(--accent-gold)' : 'var(--accent-cyan)'};"></i>
                    تعيين ${roleTitle}
                </span>
                <i class="fa-solid fa-plus"></i>
            </button>
        `;
    }
}

// Render Regular Member Item in Card
function renderMemberItem(member, comm) {
    const initial = member.name ? member.name.trim().charAt(0) : 'ع';
    return `
        <div class="member-item">
            <div class="member-main-info" onclick="viewMemberProfile('${member.id}')" style="cursor: pointer; flex: 1;">
                <div class="member-avatar-chip">${initial}</div>
                <div class="member-meta">
                    <div class="member-name" title="${escapeHtml(member.name)}">${escapeHtml(member.name)}</div>
                    <div class="member-sub">${escapeHtml(member.year || 'طالب')} • ${escapeHtml(member.department || '')}</div>
                </div>
            </div>
            <div class="member-item-actions">
                ${member.phone ? `
                    <a href="https://wa.me/2${member.phone.replace(/[^0-9]/g, '')}" target="_blank" class="btn-mini-action" title="واتساب" style="color: #25d366;">
                        <i class="fa-brands fa-whatsapp"></i>
                    </a>
                ` : ''}
                <button class="btn-mini-action" title="عرض الملف" onclick="viewMemberProfile('${member.id}')">
                    <i class="fa-solid fa-eye"></i>
                </button>
                <button class="btn-mini-action" title="تعديل" onclick="openEditMemberModal('${member.id}')">
                    <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button class="btn-mini-action danger" title="حذف" onclick="confirmDeleteMember('${member.id}')">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        </div>
    `;
}

// ==========================================================================
// 2. Master Table View
// ==========================================================================
function renderMasterTableView() {
    const tbody = document.getElementById('masterTableBody');
    tbody.innerHTML = '';

    const filtered = getFilteredMembers();

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="10" style="text-align: center; padding: 3rem; color: var(--text-muted);">
                    <i class="fa-solid fa-magnifying-glass" style="font-size: 2rem; margin-bottom: 0.75rem; color: var(--accent-cyan); opacity: 0.5;"></i>
                    <p>لا توجد بيانات مطابقة لخيارات البحث المحددة</p>
                </td>
            </tr>
        `;
        return;
    }

    filtered.forEach((member, idx) => {
        const comm = appState.committees.find(c => c.id === member.committeeId) || { name: 'غير محدد', color: '#94a3b8' };
        
        let roleTag = '';
        if (member.role === 'head') {
            roleTag = `<span class="role-badge-tag head"><i class="fa-solid fa-crown"></i> أمين اللجنة</span>`;
        } else if (member.role === 'vice_head') {
            roleTag = `<span class="role-badge-tag vice_head"><i class="fa-solid fa-star"></i> أمين مساعد</span>`;
        } else {
            roleTag = `<span class="role-badge-tag member"><i class="fa-solid fa-user"></i> عضو</span>`;
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="font-weight: 700; color: var(--text-muted); font-family: 'JetBrains Mono', monospace;">${idx + 1}</td>
            <td>
                <div style="font-weight: 700; cursor: pointer; color: var(--text-highlight);" onclick="viewMemberProfile('${member.id}')">
                    ${escapeHtml(member.name)}
                </div>
            </td>
            <td>
                <span class="comm-tag-inline" style="color: ${comm.color};">
                    <i class="${comm.icon || 'fa-solid fa-folder'}"></i>
                    ${comm.name}
                </span>
            </td>
            <td>${roleTag}</td>
            <td>${escapeHtml(member.year || '-')}</td>
            <td>${escapeHtml(member.department || '-')}</td>
            <td dir="ltr" style="text-align: right; font-family: 'JetBrains Mono', monospace;">
                ${member.phone ? `<a href="tel:${member.phone}" style="color: inherit; text-decoration: none;">${escapeHtml(member.phone)}</a>` : '-'}
            </td>
            <td dir="ltr" style="text-align: right; font-family: 'JetBrains Mono', monospace;">${escapeHtml(member.studentCode || '-')}</td>
            <td style="max-width: 220px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${escapeHtml(member.skills || '')}">
                ${escapeHtml(member.skills || '-')}
            </td>
            <td>
                <div style="display: flex; gap: 0.35rem; justify-content: center;">
                    <button class="btn-mini-action" title="عرض" onclick="viewMemberProfile('${member.id}')">
                        <i class="fa-solid fa-eye"></i>
                    </button>
                    <button class="btn-mini-action" title="تعديل" onclick="openEditMemberModal('${member.id}')">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button class="btn-mini-action danger" title="حذف" onclick="confirmDeleteMember('${member.id}')">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// ==========================================================================
// 3. Organizational Hierarchy View
// ==========================================================================
function renderHierarchyView() {
    const row = document.getElementById('orgCommitteesRow');
    row.innerHTML = '';

    appState.committees.forEach(comm => {
        const commMembers = appState.members.filter(m => m.committeeId === comm.id);
        const head = commMembers.find(m => m.role === 'head');
        const vice = commMembers.find(m => m.role === 'vice_head');
        const regularCount = commMembers.filter(m => m.role === 'member').length;

        const node = document.createElement('div');
        node.className = 'org-comm-node';
        node.innerHTML = `
            <i class="${comm.icon}" style="color: ${comm.color};"></i>
            <h4>${comm.name}</h4>
            <div style="font-size: 0.78rem; color: var(--accent-gold); margin-top: 0.25rem;">
                ${head ? escapeHtml(head.name) : 'شاغر (أمين)'}
            </div>
            <div style="font-size: 0.75rem; color: var(--accent-cyan);">
                ${vice ? escapeHtml(vice.name) : 'شاغر (أمين مساعد)'}
            </div>
            <div class="count" style="margin-top: 0.4rem; padding-top: 0.4rem; border-top: 1px dashed var(--border-subtle);">
                ${regularCount} / ${comm.maxMembers} أعضاء
            </div>
        `;
        row.appendChild(node);
    });
}

// ==========================================================================
// Search & Filter Handlers
// ==========================================================================
function handleSearch() {
    appState.searchQuery = document.getElementById('searchInput').value;
    renderCurrentView();
}

function handleFilter() {
    appState.filterCommittee = document.getElementById('filterCommittee').value;
    appState.filterRole = document.getElementById('filterRole').value;
    renderCurrentView();
}

function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('filterCommittee').value = 'all';
    document.getElementById('filterRole').value = 'all';
    appState.searchQuery = '';
    appState.filterCommittee = 'all';
    appState.filterRole = 'all';
    renderApp();
}

// ==========================================================================
// Modal Operations: Add / Edit Member
// ==========================================================================
function openAddMemberModal(committeeId = '', role = 'member') {
    appState.editingMemberId = null;
    document.getElementById('formMemberId').value = '';
    document.getElementById('memberModalTitle').innerHTML = `
        <i class="fa-solid fa-user-plus" style="color: var(--accent-cyan);"></i>
        <span>إضافة عضو جديد للاتحاد</span>
    `;
    document.getElementById('btnSaveMemberSubmit').innerHTML = `
        <i class="fa-solid fa-check"></i>
        <span>إضافة العضو</span>
    `;

    // Reset Form
    document.getElementById('memberForm').reset();

    // Pre-fill if specified
    if (committeeId) {
        document.getElementById('formCommittee').value = committeeId;
    }
    if (role) {
        document.getElementById('formRole').value = role;
    }

    openModal('memberModal');
    setTimeout(() => document.getElementById('formName').focus(), 100);
}

function openEditMemberModal(memberId) {
    const member = appState.members.find(m => m.id === memberId);
    if (!member) return;

    appState.editingMemberId = memberId;
    document.getElementById('formMemberId').value = member.id;
    document.getElementById('memberModalTitle').innerHTML = `
        <i class="fa-solid fa-user-pen" style="color: var(--accent-cyan);"></i>
        <span>تعديل بيانات العضو</span>
    `;
    document.getElementById('btnSaveMemberSubmit').innerHTML = `
        <i class="fa-solid fa-floppy-disk"></i>
        <span>حفظ التعديلات</span>
    `;

    // Fill form
    document.getElementById('formName').value = member.name || '';
    document.getElementById('formCommittee').value = member.committeeId || '';
    document.getElementById('formRole').value = member.role || 'member';
    document.getElementById('formYear').value = member.year || 'الفرقة الأولى';
    document.getElementById('formDepartment').value = member.department || 'عام';
    document.getElementById('formPhone').value = member.phone || '';
    document.getElementById('formStudentCode').value = member.studentCode || '';
    document.getElementById('formSkills').value = member.skills || '';
    document.getElementById('formNotes').value = member.notes || '';

    // If profile modal is open, close it first
    closeModal('profileModal');
    openModal('memberModal');
}

function handleSaveMember(e) {
    e.preventDefault();

    const name = document.getElementById('formName').value.trim();
    const committeeId = document.getElementById('formCommittee').value;
    const role = document.getElementById('formRole').value;
    const year = document.getElementById('formYear').value;
    const department = document.getElementById('formDepartment').value;
    const phone = document.getElementById('formPhone').value.trim();
    const studentCode = document.getElementById('formStudentCode').value.trim();
    const skills = document.getElementById('formSkills').value.trim();
    const notes = document.getElementById('formNotes').value.trim();

    if (!name || !committeeId || !role) {
        showToast('يرجى ملء الحقول الإلزامية المطلوبة', 'warning');
        return;
    }

    const commObj = appState.committees.find(c => c.id === committeeId);
    const commName = commObj ? commObj.name : 'اللجنة';

    // Conflict Check for Head / Vice Head:
    if (role === 'head' || role === 'vice_head') {
        const existingLeader = appState.members.find(m => 
            m.committeeId === committeeId && 
            m.role === role && 
            m.id !== appState.editingMemberId
        );

        if (existingLeader) {
            const roleNameAr = role === 'head' ? 'أمين' : 'أمين مساعد';
            const confirmReplace = confirm(
                `تنبيه:\nيوجد بالفعل (${roleNameAr}) لـ ${commName} وهو الطالب:\n"${existingLeader.name}".\n\nهل تود استبداله وتعيين "${name}" مكانه؟`
            );
            if (!confirmReplace) {
                return;
            } else {
                // Change previous leader's role to regular member
                existingLeader.role = 'member';
            }
        }
    }

    // Capacity check for regular members (max 8)
    if (role === 'member') {
        const currentRegularMembers = appState.members.filter(m => 
            m.committeeId === committeeId && 
            m.role === 'member' && 
            m.id !== appState.editingMemberId
        );

        if (currentRegularMembers.length >= 8) {
            const confirmExtra = confirm(
                `تنبيه:\nلجنة "${commName}" تضم بالفعل 8 أفراد (الحد الأقصى المعتاد).\nهل ترغب في إضافة هذا العضو كعضو استثنائي؟`
            );
            if (!confirmExtra) return;
        }
    }

    const currentExec = getExecutiveName();

    if (appState.editingMemberId) {
        // Edit existing
        const idx = appState.members.findIndex(m => m.id === appState.editingMemberId);
        if (idx !== -1) {
            appState.members[idx] = {
                ...appState.members[idx],
                name,
                committeeId,
                role,
                year,
                department,
                phone,
                studentCode,
                skills,
                notes,
                lastUpdatedBy: currentExec,
                lastUpdatedAt: new Date().toISOString()
            };
            showToast(`تم تحديث بيانات الطالب "${name}" بنجاح`, 'success');
        }
    } else {
        // Add new member
        const newMember = {
            id: 'm_' + Date.now(),
            name,
            committeeId,
            role,
            year,
            department,
            phone,
            studentCode,
            skills,
            notes,
            addedBy: currentExec,
            createdAt: new Date().toISOString()
        };
        appState.members.push(newMember);
        showToast(`تمت إضافة "${name}" إلى ${commName} بنجاح`, 'success');
    }

    playAudioFeedback('success');
    saveMembersToStorage();
    renderApp();
    closeModal('memberModal');
}

// ==========================================================================
// Delete Member
// ==========================================================================
function confirmDeleteMember(memberId) {
    const member = appState.members.find(m => m.id === memberId);
    if (!member) return;

    const roleName = member.role === 'head' ? 'أمين اللجنة' : (member.role === 'vice_head' ? 'أمين مساعد' : 'عضو');
    const msg = `هل أنت متأكد من حذف الطالب "${member.name}" (${roleName}) من الاتحاد؟`;

    if (confirm(msg)) {
        appState.members = appState.members.filter(m => m.id !== memberId);
        saveMembersToStorage();
        playAudioFeedback('delete');
        renderApp();
        showToast(`تم حذف الطالب "${member.name}"`, 'warning');
        closeModal('profileModal');
    }
}

// ==========================================================================
// Member Profile Drawer / Modal
// ==========================================================================
function viewMemberProfile(memberId) {
    const member = appState.members.find(m => m.id === memberId);
    if (!member) return;

    const comm = appState.committees.find(c => c.id === member.committeeId) || { name: 'غير محدد' };

    document.getElementById('profAvatar').innerText = member.name.trim().charAt(0);
    document.getElementById('profName').innerText = member.name;

    let roleBadgeHtml = '';
    if (member.role === 'head') {
        roleBadgeHtml = `<span class="role-badge-tag head" style="font-size: 0.9rem;"><i class="fa-solid fa-crown"></i> أمين ${comm.name}</span>`;
    } else if (member.role === 'vice_head') {
        roleBadgeHtml = `<span class="role-badge-tag vice_head" style="font-size: 0.9rem;"><i class="fa-solid fa-star"></i> أمين مساعد ${comm.name}</span>`;
    } else {
        roleBadgeHtml = `<span class="role-badge-tag member" style="font-size: 0.9rem;"><i class="fa-solid fa-user"></i> عضو في ${comm.name}</span>`;
    }
    document.getElementById('profRoleBadge').innerHTML = roleBadgeHtml;

    document.getElementById('profCommittee').innerText = comm.name;
    document.getElementById('profYearDept').innerText = `${member.year || 'غير محدد'} - ${member.department || 'عام'}`;
    document.getElementById('profStudentCode').innerText = member.studentCode || 'غير مسجل';
    document.getElementById('profSkills').innerText = member.skills || 'لا توجد مهارات مسجلة';
    document.getElementById('profNotes').innerText = member.notes || 'لا توجد ملاحظات';
    document.getElementById('profAddedBy').innerText = member.addedBy ? `بواسطة ${member.addedBy}` : 'إدارة الاتحاد';

    // Contact Buttons
    const whatsappBtn = document.getElementById('profWhatsAppBtn');
    const callBtn = document.getElementById('profCallBtn');

    if (member.phone) {
        const cleanPhone = member.phone.replace(/[^0-9]/g, '');
        whatsappBtn.href = `https://wa.me/2${cleanPhone}`;
        whatsappBtn.style.display = 'inline-flex';

        callBtn.href = `tel:${member.phone}`;
        callBtn.style.display = 'inline-flex';
    } else {
        whatsappBtn.style.display = 'none';
        callBtn.style.display = 'none';
    }

    // Edit button inside profile
    document.getElementById('profEditBtn').onclick = () => {
        openEditMemberModal(member.id);
    };

    openModal('profileModal');
}

// ==========================================================================
// Modal Helpers
// ==========================================================================
function openModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.add('active');
}

function closeModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.remove('active');
}

function closeModalOnOverlay(e, modalId) {
    if (e.target.id === modalId) {
        closeModal(modalId);
    }
}

// ==========================================================================
// Excel Export (Formatted CSV with Arabic UTF-8 BOM)
// ==========================================================================
function exportToExcel() {
    if (appState.members.length === 0) {
        showToast('لا توجد بيانات لتصديرها', 'warning');
        return;
    }

    const headers = [
        "م",
        "اسم الطالب",
        "اللجنة",
        "المنصب",
        "الفرقة الدراسية",
        "القسم والتخصص",
        "رقم الهاتف",
        "كود الطالب",
        "المهارات والخبرات",
        "الملاحظات",
        "تم التسجيل بواسطة"
    ];

    const rows = appState.members.map((m, idx) => {
        const comm = appState.committees.find(c => c.id === m.committeeId) || { name: 'غير محدد' };
        let roleTitle = 'عضو';
        if (m.role === 'head') roleTitle = 'أمين اللجنة';
        if (m.role === 'vice_head') roleTitle = 'أمين مساعد';

        return [
            idx + 1,
            `"${(m.name || '').replace(/"/g, '""')}"`,
            `"${comm.name}"`,
            `"${roleTitle}"`,
            `"${m.year || ''}"`,
            `"${m.department || ''}"`,
            `"\t${m.phone || ''}"`, // \t prevents Excel from truncating leading zeros
            `"\t${m.studentCode || ''}"`,
            `"${(m.skills || '').replace(/"/g, '""')}"`,
            `"${(m.notes || '').replace(/"/g, '""')}"`,
            `"${m.addedBy || ''}"`
        ];
    });

    // Add Executive Leadership at the top of the exported sheet!
    const headerLines = [
        `"كشف اتحاد طلاب كلية الحاسبات وعلوم البيانات 2027"`,
        `"رئيس الاتحاد: سيف عمرو | نائب رئيس الاتحاد: علي تيتو"`,
        `"تاريخ التصدير: ${new Date().toLocaleDateString('ar-EG')}"`,
        `""`
    ];

    let csvContent = headerLines.join('\r\n') + '\r\n';
    csvContent += headers.join(',') + '\r\n';
    rows.forEach(r => {
        csvContent += r.join(',') + '\r\n';
    });

    // \uFEFF is essential for Excel to read Arabic UTF-8 seamlessly!
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `اتحاد_طلاب_حاسبات_وعلوم_البيانات_2027_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    playAudioFeedback('success');
    showToast('تم تصدير كشف الإكسيل بنجاح!', 'success');
}

// ==========================================================================
// Official Printable Report (طباعة كشف معتمد)
// ==========================================================================
function printOfficialReport() {
    const container = document.getElementById('printCommitteesContainer');
    container.innerHTML = '';

    appState.committees.forEach(comm => {
        const commMembers = appState.members.filter(m => m.committeeId === comm.id);
        const head = commMembers.find(m => m.role === 'head');
        const vice = commMembers.find(m => m.role === 'vice_head');
        const regular = commMembers.filter(m => m.role === 'member');

        const section = document.createElement('div');
        section.className = 'print-comm-section';

        let tableRows = '';

        // Row 1: Head
        tableRows += `
            <tr style="background: #fef3c7; font-weight: bold;">
                <td style="text-align: center; width: 40px;">-</td>
                <td>${head ? escapeHtml(head.name) : '--- شاغر ---'}</td>
                <td style="color: #b45309;">أمين اللجنة</td>
                <td>${head ? escapeHtml(head.year || '') : ''}</td>
                <td>${head ? escapeHtml(head.department || '') : ''}</td>
                <td dir="ltr" style="text-align: center;">${head ? escapeHtml(head.studentCode || '') : ''}</td>
                <td dir="ltr" style="text-align: center;">${head ? escapeHtml(head.phone || '') : ''}</td>
            </tr>
        `;

        // Row 2: Vice Head
        tableRows += `
            <tr style="background: #e0f2fe; font-weight: bold;">
                <td style="text-align: center; width: 40px;">-</td>
                <td>${vice ? escapeHtml(vice.name) : '--- شاغر ---'}</td>
                <td style="color: #0369a1;">أمين مساعد</td>
                <td>${vice ? escapeHtml(vice.year || '') : ''}</td>
                <td>${vice ? escapeHtml(vice.department || '') : ''}</td>
                <td dir="ltr" style="text-align: center;">${vice ? escapeHtml(vice.studentCode || '') : ''}</td>
                <td dir="ltr" style="text-align: center;">${vice ? escapeHtml(vice.phone || '') : ''}</td>
            </tr>
        `;

        // Rows 3-10: 8 Regular Members
        for (let i = 0; i < 8; i++) {
            const m = regular[i];
            tableRows += `
                <tr>
                    <td style="text-align: center; font-weight: bold;">${i + 1}</td>
                    <td>${m ? escapeHtml(m.name) : '................................................'}</td>
                    <td>عضو لجنة</td>
                    <td>${m ? escapeHtml(m.year || '') : ''}</td>
                    <td>${m ? escapeHtml(m.department || '') : ''}</td>
                    <td dir="ltr" style="text-align: center;">${m ? escapeHtml(m.studentCode || '') : ''}</td>
                    <td dir="ltr" style="text-align: center;">${m ? escapeHtml(m.phone || '') : ''}</td>
                </tr>
            `;
        }

        section.innerHTML = `
            <div class="print-comm-title">${comm.name} (تشكيل اللجنة)</div>
            <table class="print-table">
                <thead>
                    <tr>
                        <th style="width: 40px; text-align: center;">م</th>
                        <th>اسم الطالب بالكامل</th>
                        <th>الصفة / المنصب</th>
                        <th>الفرقة</th>
                        <th>القسم / التخصص</th>
                        <th>الكود الجامعي</th>
                        <th>رقم التليفون</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        `;

        container.appendChild(section);
    });

    window.print();
}

// ==========================================================================
// Backup, Restore & Reset
// ==========================================================================
function openBackupModal() {
    openModal('backupModal');
}

function downloadBackupJSON() {
    const backupData = {
        title: "اتحاد طلاب كلية الحاسبات وعلوم البيانات 2027",
        president: UNION_LEADERS.president,
        vicePresident: UNION_LEADERS.vicePresident,
        exportDate: new Date().toISOString(),
        members: appState.members
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `نسخة_احتياطية_اتحاد_حاسبات_2027_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showToast('تم تحميل ملف النسخة الاحتياطية بنجاح', 'success');
}

function handleImportBackup(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const parsed = JSON.parse(event.target.result);
            if (parsed && Array.isArray(parsed.members)) {
                if (confirm(`تم العثور على (${parsed.members.length}) عضواً في الملف.\nهل تريد استبدال البيانات الحالية بهذه النسخة؟`)) {
                    appState.members = parsed.members;
                    saveMembersToStorage();
                    renderApp();
                    showToast('تم استيراد النسخة الاحتياطية بنجاح!', 'success');
                    closeModal('backupModal');
                }
            } else {
                showToast('صيغة ملف النسخة الاحتياطية غير صالحة', 'error');
            }
        } catch (err) {
            showToast('حدث خطأ أثناء قراءة الملف', 'error');
        }
    };
    reader.readAsText(file);
    e.target.value = '';
}

function clearAllMembers() {
    if (confirm('تنبيه هام:\nهل أنت متأكد من تصفير ومسح كافة الأعضاء المسجلين في الاتحاد (0 أعضاء)؟\nلن يتم إضافة أي طالب إلا بقرار منك أو من نائب الرئيس.')) {
        appState.members = [];
        saveMembersToStorage();
        playAudioFeedback('delete');
        renderApp();
        showToast('تم تصفير جميع أعضاء ولجان الاتحاد بنجاح (0 أعضاء)', 'warning');
        closeModal('backupModal');
    }
}

// ==========================================================================
// Toast Notifications
// ==========================================================================
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconClass = 'fa-solid fa-circle-info';
    if (type === 'success') iconClass = 'fa-solid fa-circle-check';
    if (type === 'warning') iconClass = 'fa-solid fa-triangle-exclamation';
    if (type === 'error') iconClass = 'fa-solid fa-circle-exclamation';

    toast.innerHTML = `
        <i class="${iconClass}"></i>
        <span>${escapeHtml(message)}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// Helper: Escape HTML to avoid XSS
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
