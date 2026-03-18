document.addEventListener('DOMContentLoaded', function() {
    document.addEventListener('click', function(event) {
        var trigger = event.target.closest('.latest-date, [data-open-calendar]');
        if (!trigger) {
            return;
        }

        event.preventDefault();
        showCalendarModal();
    });
});

var availableDatesPromise = null;

function getRootPrefix() {
    var parts = window.location.pathname.split('/').filter(Boolean);
    return parts.length > 1 ? '../' : '';
}

function getAvailableDatesUrl() {
    return getRootPrefix() + 'available-dates.json';
}

function loadAvailableDates() {
    if (!availableDatesPromise) {
        availableDatesPromise = fetch(getAvailableDatesUrl())
            .then(function(response) {
                if (!response.ok) {
                    throw new Error('Failed to load available dates');
                }
                return response.json();
            })
            .then(function(data) {
                return Array.isArray(data.dates) ? data.dates.slice().sort(function(a, b) {
                    return b.date.localeCompare(a.date);
                }) : [];
            })
            .catch(function() {
                return [];
            });
    }

    return availableDatesPromise;
}

function closeCalendarModal() {
    var modal = document.getElementById('calendarModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

async function showCalendarModal() {
    var dates = await loadAvailableDates();
    var modal = document.getElementById('calendarModal');

    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'calendarModal';
        modal.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:9999;justify-content:center;align-items:center;padding:20px;';
        modal.onclick = function(event) {
            if (event.target === modal) {
                closeCalendarModal();
            }
        };
        document.body.appendChild(modal);
    }

    modal.innerHTML = '';

    var panel = document.createElement('div');
    panel.style.cssText = isMobile()
        ? 'background:#1a1a2e;border:1px solid rgba(0,217,255,0.2);border-radius:20px 20px 0 0;width:100%;max-width:420px;padding:20px 20px 32px;align-self:flex-end;box-shadow:0 10px 40px rgba(0,0,0,0.45);'
        : 'background:#1a1a2e;border:1px solid rgba(0,217,255,0.2);border-radius:18px;width:100%;max-width:420px;padding:24px;box-shadow:0 10px 40px rgba(0,0,0,0.45);';

    var header = document.createElement('div');
    header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;';
    header.innerHTML = '<span style="color:#00d9ff;font-size:18px;font-weight:bold;">📅 选择日期</span><button type="button" id="calendarCloseBtn" style="background:none;border:none;color:#666;font-size:28px;cursor:pointer;line-height:1;">×</button>';
    panel.appendChild(header);

    var description = document.createElement('p');
    description.style.cssText = 'color:#888;font-size:13px;line-height:1.6;margin-bottom:18px;';
    description.textContent = dates.length ? '只展示已有内容的日期，避免跳到空页面。' : '暂时没有可用日期。';
    panel.appendChild(description);

    var list = document.createElement('div');
    list.style.cssText = 'display:grid;gap:10px;';

    dates.forEach(function(item, index) {
        var button = document.createElement('button');
        button.type = 'button';
        button.style.cssText = 'display:flex;justify-content:space-between;align-items:center;width:100%;padding:14px 16px;background:' + (index === 0 ? 'rgba(0,217,255,0.14)' : 'rgba(255,255,255,0.04)') + ';border:1px solid ' + (index === 0 ? 'rgba(0,217,255,0.35)' : 'rgba(255,255,255,0.08)') + ';border-radius:12px;color:#fff;cursor:pointer;text-align:left;';
        button.innerHTML = '<span><strong style="display:block;font-size:15px;">' + item.date + '</strong><span style="color:#888;font-size:12px;">第 ' + item.issue + ' 期</span></span><span style="color:#00d9ff;font-size:12px;">' + item.toolCount + ' 条</span>';
        button.onclick = function() {
            window.location.href = getRootPrefix() + item.date + '/list.html';
        };
        list.appendChild(button);
    });

    panel.appendChild(list);
    modal.appendChild(panel);
    modal.style.display = 'flex';

    var closeButton = document.getElementById('calendarCloseBtn');
    if (closeButton) {
        closeButton.onclick = closeCalendarModal;
    }
}

function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        || window.innerWidth < 768;
}
