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

// 判断是否为移动端
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
        || window.innerWidth < 768;
}

function showCalendarModal() {
    var modal = document.getElementById('calendarModal');
    if (modal) {
        modal.style.display = 'flex';
        return;
    }
    
    modal = document.createElement('div');
    modal.id = 'calendarModal';
    
    // 根据设备类型选择不同的样式
    if (isMobile()) {
        // 移动端：底部弹出滚轮选择器
        modal.style.cssText = 'display:flex;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9999;justify-content:center;align-items:flex-end;';
        
        var content = document.createElement('div');
        content.style.cssText = 'background:#1a1a2e;border-radius:20px 20px 0 0;width:100%;max-width:400px;padding:20px 20px 40px;';
        
        var header = document.createElement('div');
        header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;';
        header.innerHTML = '<span style="color:#00d9ff;font-size:16px;">📅 选择日期</span><button id="calendarCloseBtn" style="background:none;border:none;color:#666;font-size:28px;cursor:pointer;padding:0;line-height:1;">×</button>';
        
        var pickerContainer = document.createElement('div');
        pickerContainer.id = 'datePickerContainer';
        pickerContainer.style.cssText = 'display:flex;justify-content:center;gap:10px;height:150px;overflow:hidden;position:relative;';
        
        var years = [], months = [], days = [];
        for(var y = 2025; y <= 2027; y++) years.push(y);
        for(var m = 1; m <= 12; m++) months.push(m);
        for(var d = 1; d <= 31; d++) days.push(d);
        
        pickerContainer.innerHTML = createPickerColumn('yearPicker', years, '年') +
                                    createPickerColumn('monthPicker', months, '月') +
                                    createPickerColumn('dayPicker', days, '日');
        
        var confirmBtn = document.createElement('button');
        confirmBtn.id = 'calendarConfirmBtn';
        confirmBtn.style.cssText = 'width:100%;padding:14px;background:linear-gradient(135deg,#00d9ff,#0099ff);border:none;border-radius:12px;color:#000;font-size:16px;font-weight:bold;cursor:pointer;margin-top:20px;';
        confirmBtn.textContent = '确认';
        
        content.appendChild(header);
        content.appendChild(pickerContainer);
        content.appendChild(confirmBtn);
        modal.appendChild(content);
        
        modal.onclick = function(e) { if(e.target === modal) modal.style.display = 'none'; };
        document.body.appendChild(modal);
        
        document.getElementById('calendarCloseBtn').onclick = function() { modal.style.display = 'none'; };
        
        document.getElementById('calendarConfirmBtn').onclick = function() {
            var year = document.querySelector('#yearPicker .picker-item.selected')?.textContent.replace('年','') || '2026';
            var month = document.querySelector('#monthPicker .picker-item.selected')?.textContent.replace('月','') || '3';
            var day = document.querySelector('#dayPicker .picker-item.selected')?.textContent.replace('日','') || '16';
            var dateStr = year + '-' + (month<10?'0'+month:month) + '-' + (day<10?'0'+day:day);
            window.location.href = dateStr + '/list.html';
        };
        
        initPickerScroll('yearPicker', '2026');
        initPickerScroll('monthPicker', '3');
        initPickerScroll('dayPicker', '16');
        
    } else {
        // PC 端：居中网格日历
        modal.style.cssText = 'display:flex;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);z-index:9999;justify-content:center;align-items:center;';
        
        var cal = document.createElement('div');
        cal.style.cssText = 'background:#1a1a2e;border-radius:16px;padding:24px;width:360px;border:1px solid #00d9ff;box-shadow:0 10px 40px rgba(0,0,0,0.5);';
        
        var calHeader = document.createElement('div');
        calHeader.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;';
        calHeader.innerHTML = '<span style="color:#00d9ff;font-size:18px;font-weight:bold;">📅 选择日期</span><button id="calendarCloseBtn" style="background:none;border:none;color:#666;font-size:24px;cursor:pointer;">×</button>';
        
        var calGrid = document.createElement('div');
        calGrid.id = 'calendarGrid';
        calGrid.style.cssText = 'display:grid;grid-template-columns:repeat(7,1fr);gap:4px;';
        
        cal.appendChild(calHeader);
        cal.appendChild(calGrid);
        modal.appendChild(cal);
        
        modal.onclick = function(e) { if(e.target === modal) modal.style.display = 'none'; };
        document.body.appendChild(modal);
        
        document.getElementById('calendarCloseBtn').onclick = function() { modal.style.display = 'none'; };
        
        renderPCCalendar();
    }
}

// PC 端日历渲染
function renderPCCalendar() {
    var grid = document.getElementById('calendarGrid');
    if(!grid) return;
    
    var datesWithData = {'2026-03-16': 10};
    var headers = ['日','一','二','三','四','五','六'];
    var html = '';
    
    // 星期标题
    for(var i=0;i<headers.length;i++) {
        html += '<div style="text-align:center;color:#666;font-size:12px;padding:8px 0;">'+headers[i]+'</div>';
    }
    
    // 3月的日期（2026年3月1日是周日）
    var daysInMonth = 31;
    for(var day=1; day<=daysInMonth; day++) {
        var dateStr = '2026-03-'+(day<10?'0'+day:day);
        if(datesWithData[dateStr]) {
            // 有数据的日期 - 绿色高亮可点击
            html += '<div onclick="window.location.href=\''+dateStr+'/list.html\'" style="text-align:center;padding:10px 0;background:#00ff88;color:#000;border-radius:6px;cursor:pointer;font-weight:bold;">'+day+'</div>';
        } else if (day === 16) {
            // 当前选中日期
            html += '<div style="text-align:center;padding:10px 0;background:#00d9ff;color:#000;border-radius:6px;font-weight:bold;">'+day+'</div>';
        } else {
            // 普通日期
            html += '<div style="text-align:center;padding:10px 0;color:#aaa;cursor:default;">'+day+'</div>';
        }
    }
    grid.innerHTML = html;
}

// 移动端滚轮选择器相关函数
function createPickerColumn(id, data, suffix) {
    var html = '<div id="' + id + '" class="picker-column" style="flex:1;text-align:center;position:relative;height:100%;overflow:hidden;">';
    html += '<div class="picker-content" style="padding:50px 0;">';
    for(var i = 0; i < data.length; i++) {
        html += '<div class="picker-item" data-value="' + data[i] + '" style="padding:10px;font-size:18px;color:#666;transition:all 0.2s;">' + data[i] + suffix + '</div>';
    }
    html += '</div>';
    html += '<div class="picker-highlight" style="position:absolute;top:50px;left:0;right:0;height:50px;border-top:1px solid #00d9ff;border-bottom:1px solid #00d9ff;pointer-events:none;"></div>';
    html += '</div>';
    return html;
}

function initPickerScroll(pickerId, currentValue) {
    var picker = document.getElementById(pickerId);
    if(!picker) return;
    
    var items = picker.querySelectorAll('.picker-item');
    var content = picker.querySelector('.picker-content');
    
    for(var i = 0; i < items.length; i++) {
        var val = items[i].getAttribute('data-value');
        if(val === currentValue) {
            items[i].classList.add('selected');
            items[i].style.color = '#00d9ff';
            items[i].style.fontWeight = 'bold';
            items[i].style.transform = 'scale(1.1)';
            var offset = i * 50 - 50;
            content.style.transform = 'translateY(' + offset + 'px)';
            break;
        }
    }
    
    var isScrolling = false;
    var startY = 0;
    var currentTranslate = 0;
    
    picker.addEventListener('touchstart', function(e) {
        startY = e.touches[0].clientY;
        isScrolling = true;
    });
    
    picker.addEventListener('touchmove', function(e) {
        if(!isScrolling) return;
        var deltaY = e.touches[0].clientY - startY;
        currentTranslate += deltaY;
        var minTranslate = -(items.length - 1) * 50;
        if(currentTranslate > 0) currentTranslate = 0;
        if(currentTranslate < minTranslate) currentTranslate = minTranslate;
        
        content.style.transform = 'translateY(' + currentTranslate + 'px)';
        startY = e.touches[0].clientY;
        updateSelectedItem(picker, content);
    });
    
    picker.addEventListener('touchend', function() {
        isScrolling = false;
        snapToItem(picker, content, items);
    });
    
    picker.addEventListener('wheel', function(e) {
        e.preventDefault();
        currentTranslate -= e.deltaY;
        var minTranslate = -(items.length - 1) * 50;
        if(currentTranslate > 0) currentTranslate = 0;
        if(currentTranslate < minTranslate) currentTranslate = minTranslate;
        
        content.style.transform = 'translateY(' + currentTranslate + 'px)';
        snapToItem(picker, content, items);
    });
}

function updateSelectedItem(picker, content) {
    var items = picker.querySelectorAll('.picker-item');
    var translate = parseInt(content.style.transform.replace('translateY(','').replace('px)','') || '0');
    var centerIndex = Math.round(-translate / 50);
    
    items.forEach(function(item, i) {
        if(i === centerIndex) {
            item.classList.add('selected');
            item.style.color = '#00d9ff';
            item.style.fontWeight = 'bold';
            item.style.transform = 'scale(1.1)';
        } else {
            item.classList.remove('selected');
            item.style.color = '#666';
            item.style.fontWeight = 'normal';
            item.style.transform = 'scale(1)';
        }
    });
}

function snapToItem(picker, content, items) {
    var translate = parseInt(content.style.transform.replace('translateY(','').replace('px)','') || '0');
    var centerIndex = Math.round(-translate / 50);
    var snapTranslate = centerIndex * 50;
    
    content.style.transition = 'transform 0.3s ease-out';
    content.style.transform = 'translateY(' + snapTranslate + 'px)';
    
    setTimeout(function() {
        updateSelectedItem(picker, content);
        content.style.transition = '';
    }, 300);
}
