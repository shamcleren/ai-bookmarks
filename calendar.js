// 全局日历组件
document.addEventListener('DOMContentLoaded', function() {
    var datesWithData = {'2026-03-16': 10};
    
    setTimeout(function() {
        var latestDate = document.querySelector('.latest-date');
        if (latestDate) {
            latestDate.style.cursor = 'pointer';
            latestDate.title = '点击选择日期 🔽';
            latestDate.onclick = function() { showCalendarModal(); };
            // 添加悬停动画
            latestDate.style.transition = 'all 0.3s';
            latestDate.onmouseover = function() {
                this.style.transform = 'scale(1.05)';
                this.style.boxShadow = '0 0 25px rgba(0,217,255,0.6)';
            };
            latestDate.onmouseout = function() {
                this.style.transform = 'scale(1)';
                this.style.boxShadow = '0 0 15px rgba(0,217,255,0.4)';
            };
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
    
    modal.innerHTML = '<div style="background:#1a1a2e;border-radius:16px;padding:30px;max-width:400px;width:90%;border:1px solid rgba(0,217,255,0.5);box-shadow:0 0 40px rgba(0,217,255,0.3);">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">' +
        '<h3 style="color:#00d9ff;margin:0;font-size:18px;">📅 选择日期</h3>' +
        '<button onclick="document.getElementById(\'calendarModal\').style.display=\'none\'" style="background:none;border:none;color:#666;font-size:28px;cursor:pointer;padding:0;line-height:1;">×</button></div>' +
        '<div id="modalCalendarGrid" style="display:grid;grid-template-columns:repeat(7,1fr);gap:10px;"></div></div>';
    
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
    
    var html = headers.map(function(h){return '<div style="text-align:center;color:#666;font-size:12px;padding:10px;">'+h+'</div>'}).join('');
    for(var i=0;i<firstDay;i++) html+='<div></div>';
    
    for(var day=1; day<=daysInMonth; day++) {
        var dateStr = '2026-03-'+(day<10?'0'+day:day);
        var hasData = datesWithData[dateStr];
        
        if(hasData) {
            html += '<div onclick="window.location.href=\''+dateStr+'/list.html\'" style="text-align:center;padding:15px;background:linear-gradient(135deg,rgba(0,255,136,0.3),rgba(0,217,255,0.3));color:#fff;border-radius:10px;cursor:pointer;font-size:14px;font-weight:bold;transition:all 0.3s;">'+day+'<div style="font-size:10px;opacity:0.8;">'+hasData+'条</div></div>';
        } else {
            html += '<div style="text-align:center;padding:15px;color:#444;font-size:14px;background:rgba(255,255,255,0.05);border-radius:10px;">'+day+'</div>';
        }
    }
    grid.innerHTML = html;
}
