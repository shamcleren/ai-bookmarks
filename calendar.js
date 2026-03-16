// 全局日历组件
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initCalendar, 1500);
});

function initCalendar() {
    var latestDate = document.querySelector('.latest-date');
    if (latestDate) {
        latestDate.style.cursor = 'pointer';
        latestDate.title = '点击选择日期';
        latestDate.onclick = function() { showCalendarModal(); };
    }
}

function showCalendarModal() {
    var modal = document.getElementById('calendarModal');
    if (modal) {
        modal.style.display = 'flex';
        return;
    }
    
    modal = document.createElement('div');
    modal.id = 'calendarModal';
    modal.style.cssText = 'display:flex;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);z-index:9999;justify-content:center;align-items:center;';
    
    modal.innerHTML = '<div style="background:#1a1a2e;border-radius:16px;padding:30px;max-width:400px;width:90%;border:1px solid #00d9ff;">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">' +
        '<h3 style="color:#00d9ff;margin:0;">📅 选择日期</h3>' +
        '<button onclick="document.getElementById(\'calendarModal\').style.display=\'none\'" style="background:none;border:none;color:#666;font-size:24px;cursor:pointer;">×</button></div>' +
        '<div id="modalCalendarGrid"></div></div>';
    
    modal.onclick = function(e) { if(e.target===modal)modal.style.display='none'; };
    document.body.appendChild(modal);
    renderCalendar();
}

function renderCalendar() {
    var grid = document.getElementById('modalCalendarGrid');
    if(!grid) return;
    
    var datesWithData = {'2026-03-16': 10};
    var headers = ['日','一','二','三','四','五','六'];
    var html = '';
    
    for(var i=0;i<headers.length;i++) {
        html += '<div style="text-align:center;color:#666;padding:10px;">'+headers[i]+'</div>';
    }
    
    // 空白
    for(var i=0;i<0;i++) html += '<div></div>';
    
    for(var day=1; day<=31; day++) {
        var dateStr = '2026-03-'+(day<10?'0'+day:day);
        if(datesWithData[dateStr]) {
            html += '<div onclick="window.location.href=\''+dateStr+'/list.html\'" style="text-align:center;padding:15px;background:#00ff88;color:#000;border-radius:8px;cursor:pointer;">'+day+'</div>';
        } else {
            html += '<div style="text-align:center;padding:15px;color:#444;">'+day+'</div>';
        }
    }
    grid.innerHTML = html;
}
