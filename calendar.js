// 全局日历组件
document.addEventListener('DOMContentLoaded', function() {
    const datesWithData = {'2026-03-16': 10};
    
    // 点击日期弹出日历
    setTimeout(function() {
        var latestDate = document.querySelector('.latest-date');
        if (latestDate) {
            latestDate.style.cursor = 'pointer';
            latestDate.title = '点击选择日期';
            latestDate.onclick = function() { showCalendarModal(); };
        }
    }, 500);
});

function showCalendarModal() {
    var modal = document.getElementById('calendarModal');
    if (modal) {
        modal.style.display = 'flex';
        return;
    }
    
    modal = document.createElement('div');
    modal.id = 'calendarModal';
    modal.style.cssText = 'display:flex;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);z-index:9999;justify-content:center;align-items:center;';
    
    modal.innerHTML = '<div style="background:#1a1a2e;border-radius:16px;padding:30px;max-width:400px;width:90%;border:1px solid rgba(0,217,255,0.3);">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">' +
        '<h3 style="color:#00d9ff;margin:0;">📅 选择日期</h3>' +
        '<button onclick="document.getElementById(\'calendarModal\').style.display=\'none\'" style="background:none;border:none;color:#666;font-size:24px;cursor:pointer;">×</button></div>' +
        '<div id="modalCalendarGrid" style="display:grid;grid-template-columns:repeat(7,1fr);gap:8px;"></div></div>';
    
    modal.onclick = function(e) { if(e.target===modal)modal.style.display='none'; };
    document.body.appendChild(modal);
    renderCalendar();
}

function renderCalendar() {
    var grid = document.getElementById('modalCalendarGrid');
    if(!grid) return;
    
    var headers = ['日','一','二','三','四','五','六'];
    var year=2026, month=2, firstDay=new Date(year,month,1).getDay(), daysInMonth=new Date(year,month+1,0).getDate();
    var datesWithData = {'2026-03-16': 10};
    
    var html = headers.map(function(h){return '<div style="text-align:center;color:#666;font-size:12px;padding:8px;">'+h+'</div>'}).join('');
    for(var i=0;i<firstDay;i++) html+='<div></div>';
    
    for(var day=1; day<=daysInMonth; day++) {
        var dateStr = '2026-03-'+(day<10?'0'+day:day);
        var hasData = datesWithData[dateStr];
        
        if(hasData) {
            html += '<div onclick="window.location.href=\''+dateStr+'/list.html\'" style="text-align:center;padding:12px;background:rgba(0,255,136,0.2);color:#00ff88;border-radius:8px;cursor:pointer;font-size:14px;">'+day+'<div style="font-size:10px;">'+hasData+'条</div></div>';
        } else {
            html += '<div style="text-align:center;padding:12px;color:#444;font-size:14px;">'+day+'</div>';
        }
    }
    grid.innerHTML = html;
}
