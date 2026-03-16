// 全局日历组件 - 点击日期触发
(function() {
    const datesWithData = {'2026-03-16': 10};
    
    function makeDateClickable() {
        setTimeout(function() {
            // 查找首页的日期元素 - 最新一期的日期
            const latestDate = document.querySelector('.latest-date');
            if (latestDate) {
                latestDate.style.cursor = 'pointer';
                latestDate.onclick = function() {
                    showCalendarModal();
                };
            }
            
            // 查找导航栏的日历链接，如果存在则改造成日期样式
            const navCalendar = document.querySelector('.nav a[href*="calendar"], .nav a:has(📅)');
            if (navCalendar) {
                navCalendar.innerHTML = '📅 03-16';
                navCalendar.onclick = function() { showCalendarModal(); };
            }
        }, 100);
    }
    
    function showCalendarModal() {
        let modal = document.getElementById('calendarModal');
        if (modal) {
            modal.style.display = 'flex';
            return;
        }
        
        modal = document.createElement('div');
        modal.id = 'calendarModal';
        modal.style.cssText = 'display:flex;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);z-index:9999;justify-content:center;align-items:center;';
        
        modal.innerHTML = `
            <div style="background:#1a1a2e;border-radius:16px;padding:30px;max-width:400px;width:90%;border:1px solid rgba(0,217,255,0.3);">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
                    <h3 style="color:#00d9ff;margin:0;">📅 选择日期</h3>
                    <button onclick="document.getElementById('calendarModal').style.display='none'" style="background:none;border:none;color:#666;font-size:24px;cursor:pointer;">×</button>
                </div>
                <div id="modalCalendarGrid" style="display:grid;grid-template-columns:repeat(7,1fr);gap:8px;"></div>
            </div>
        `;
        
        modal.addEventListener('click', function(e) {
            if (e.target === modal) modal.style.display = 'none';
        });
        
        document.body.appendChild(modal);
        renderCalendar();
    }
    
    function renderCalendar() {
        const grid = document.getElementById('modalCalendarGrid');
        if (!grid) return;
        
        const headers = ['日','一','二','三','四','五','六'];
        const year = 2026, month = 2;
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        let html = headers.map(h => '<div style="text-align:center;color:#666;font-size:12px;padding:8px;">'+h+'</div>').join('');
        
        for (let i = 0; i < firstDay; i++) html += '<div></div>';
        
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = '2026-03-' + (day < 10 ? '0' + day : day);
            const hasData = datesWithData[dateStr];
            
            if (hasData) {
                html += '<div onclick="window.location.href=\''+dateStr+'/list.html\'" style="text-align:center;padding:12px;background:rgba(0,255,136,0.2);color:#00ff88;border-radius:8px;cursor:pointer;font-size:14px;">'+day+'<div style="font-size:10px;">'+hasData+'条</div></div>';
            } else {
                html += '<div style="text-align:center;padding:12px;color:#444;font-size:14px;">'+day+'</div>';
            }
        }
        
        grid.innerHTML = html;
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', makeDateClickable);
    } else {
        makeDateClickable();
    }
})();
