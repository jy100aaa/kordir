var statisticsVariable = {
	saveStr: ''
};
var cur = -1, prv = -1;
$(function(){
	var now = new Date();
	var tda = new Date(now.getTime() - (24 * 60 * 60 * 1000 * 29));
	statisticsChartData.statisticsTypeText = '20' + (tda.getYear() % 100) + '/' + (tda.getMonth() + 1) + '/' + tda.getDate() + ' ~ ' + '20' + (now.getYear() % 100) + '/' + (now.getMonth() + 1) + '/' + now.getDate();
	$("#analytics-statistics .statistics-control-wrapper #statistics-data-type").children('.statistics-data-type-value').text(statisticsChartData.statisticsTypeText);

	$("#analytics-statistics .statistics-control-wrapper #statistics-data-type").bind('keypress', function(e){
		e.preventDefault();
		return true;
	});
	$("#analytics-statistics .statistics-control-wrapper #statistics-data-dropdown .statistics-data-dropdown-item").bind('click', function(){
		data_range_change(this);
	});

	$("#analytics-statistics .statistics-control-wrapper #statistics-data-type").prop('menu-on', false);
	$("#analytics-statistics .statistics-control-wrapper #statistics-data-type").blur(function(){
		var toggle = $(this).prop('menu-on');
		if(toggle){
			$(this).parent().children('ul').fadeOut(150);
			$(this).prop('menu-on', false);
		}
	});
	$("#analytics-statistics .statistics-control-wrapper #statistics-data-type").bind('click', function(){
		var toggle = $(this).prop('menu-on');
		if(toggle){
			$(this).blur();
		} else {
			$(this).focus();
			$(this).parent().children('ul').fadeIn(150);
			$(this).prop('menu-on', true);
		}
	});
	$('body').bind("click", function(e){
		var className = get_clicked_property(e, 'class');
		if(typeof className == 'undefined' || typeof className == 'object'){
			className = '';
		}
		var rangeObj = $("#analytics-statistics .statistics-control-wrapper #statistics-data-type");
		var toggle = $(rangeObj).prop('menu-on');
		if(toggle && className.indexOf('statistics-data-type') == -1)
		{
			$(rangeObj).parent().children('ul').fadeOut(150);
			$(rangeObj).prop('menu-on', false);
		}
	});
	// statistics chart
	statisticsChartData.pageView.obj = "statistics-pageview-chart";
	statisticsChartData.dailyVisitor.obj = "statistics-daily-visitor-chart";
	statisticsChartData.unique.obj = "statistics-unique-chart";
	statisticsChartData.newReturnVisitor.obj = "statistics-new-return-chart";
	statisticsChartData.device.obj = "statistics-device-chart";
	statisticsChartData.region.obj = "statistics-region-chart";
	statisticsChartData.referral.obj = "statistics-referral-chart";
	statisticsChartData.page.obj = "statistics-pageview-detail-chart";
	statisticsChartData.keyword.obj = "statistics-keyword-chart";


	$('#jrange div').datepicker({
		maxDate: '0',
		minDate: '-6M',
		changeMonth: true,
		changeYear: true,
		showButtonPanel: true,
		beforeShowDay: function ( date ) {
			return [true, ( (date.getTime() >= Math.min(prv, cur) && date.getTime() <= Math.max(prv, cur)) ? 'date-range-selected' : '')];
		},
		onSelect: function ( dateText, inst ) {
			var d1, d2;
			prv = cur;
			cur = (new Date(inst.selectedYear, inst.selectedMonth, inst.selectedDay)).getTime();
			if ( prv == -1 || prv == cur ) {
				prv = cur;
			$("#analytics-statistics .statistics-control-wrapper #statistics-data-type").children('.statistics-data-type-value').text(dateText);
			} else {
				d1 = $.datepicker.formatDate( 'yy/mm/dd', new Date(Math.min(prv,cur)), {} );
				d2 = $.datepicker.formatDate( 'yy/mm/dd', new Date(Math.max(prv,cur)), {} );
				$("#analytics-statistics .statistics-control-wrapper #statistics-data-type").children('.statistics-data-type-value').text(d1+' ~ '+d2);
			}
		},
		onChangeMonthYear: function ( year, month, inst ) {
			//prv = cur = -1;
		},
		onAfterUpdate: function ( inst ) {
			$('<button type="button" class="ui-datepicker-close ui-state-default ui-priority-primary ui-corner-all" data-handler="hide" data-event="click">닫기</button>')
			.appendTo($('#jrange div .ui-datepicker-buttonpane'))
			.on('click', function () {
				$("#analytics-statistics .statistics-control-wrapper #statistics-data-type").children('.statistics-data-type-value').text(statisticsVariable.saveStr);
				$('#jrange div').hide();
			});

			$('<button type="button" class="ui-datepicker-close ui-state-default ui-priority-primary ui-corner-all" data-handler="hide" data-event="click">선택</button>')
			.appendTo($('#jrange div .ui-datepicker-buttonpane'))
			.on('click', function () {
				if ( prv == -1 || prv == cur ) {
				} else {
					statisticsChartData.statisticsStart = $.datepicker.formatDate( 'yy/mm/dd', new Date(Math.min(prv,cur)), {} );
					statisticsChartData.statisticsEnd = $.datepicker.formatDate( 'yy/mm/dd', new Date(Math.max(prv,cur)), {} );
					statisticsChartData.statisticsTypeText = statisticsChartData.statisticsStart + ' ~ ' + statisticsChartData.statisticsEnd;
					statisticsChartData.statisticsType = '9';
					$("#analytics-statistics .statistics-control-wrapper #statistics-data-type").children('.statistics-data-type-value').text(statisticsChartData.statisticsTypeText);
					$('#jrange div').hide();
					load_statistics();
				}
			});
	    }
	})
	.position({
		of: $('#jrange')
	}).hide();

    google.charts.load('current', {'packages': ['geochart', 'corechart', 'table'], 'language': 'ko'});
    google.charts.setOnLoadCallback(function(){
        var readyStateCheckInterval = setInterval(function() {
            if (document.readyState === "complete") {
                clearInterval(readyStateCheckInterval);
                if(statisticsChartData.statisticsLoaded == false) {
                    load_statistics();
                } else {
                    load_statistics_chart();
                }
            }
        }, 100);
    });
	$("#analytics-statistics").on('remove', function(){
		$("body").unbind("click");
	});

	variable.resizeFunc[variable.currentLocation] = statistics_window_size_adjustment;
});
function draw_chart(c){
	var obj = null;
	var data = google.visualization.arrayToDataTable(c.data);
	var options = c.options;
	try {
		obj = document.getElementById(c.obj);
	} catch(err) {
		return;
	}
	var chart;

	try {
		if(oldIE){
			chart = new google.visualization.Table(obj);
		} else {
			if(c.type == INFOGRAPHIC_TYPE.PIE_CHART){
				chart = new google.visualization.PieChart(obj)
			} else if(c.type == INFOGRAPHIC_TYPE.LINE_CHART){
		        chart = new google.visualization.LineChart(obj);
			} else if(c.type == INFOGRAPHIC_TYPE.COLUMN_CHART){
				chart = new google.visualization.ColumnChart(obj);
		        options['colors'] = ['#789'];
			} else if(c.type == INFOGRAPHIC_TYPE.BAR_CHART){
				chart = new google.visualization.BarChart(obj);
		        options['colors'] = ['#789'];
			} else if(c.type == INFOGRAPHIC_TYPE.TABLE){
				chart = new google.visualization.Table(obj);
                google.visualization.events.addListener(chart, 'select', function(e){
                    var td = $("#statistics-keyword-chart .google-visualization-table-tr-sel .google-visualization-table-td");
                    if (td.length > 0) {
                        var keyword = td[0].innerHTML;
                        if (keyword === '키워드 없음') {
                            keyword = '';
                        }
                        var d = statisticsChartData.keyword.raw[keyword];
                        var ips = {};
                        for(key in d) {
                            if (key !== 'count') {
                                ips[key] = d[key];
                            }
                        }
                        // Create items array
                        var items = Object.keys(ips).map(function(key) {
                            return [key, ips[key]];
                        });

                        // Sort the array based on the second element
                        items.sort(function(first, second) {
                            return second[1] - first[1];
                        });

                        var ul = document.createElement('ul');
                        ul.style.textAlign = 'left';
                        ul.style.padding = '0';
                        ul.style.margin = '0';
                        ul.style.listStyleType = 'none';
                        ul.style.maxHeight = '120px';
                        ul.style.overflowY = 'auto';
                        for (var i = 0; i < items.length; i++) {
                            var ip = parseInt(items[i][0], 10);
                            var li = document.createElement('li');
                            li.style.height = '20px';
                            li.style.lineHeight = '20px';
                            li.style.fontSize = '11px';
                            li.style.paddingLeft = '6px';
                            li.innerHTML = [ip >>> 24, ip >>> 16 & 0xFF, ip >>> 8 & 0xFF, ip & 0xFF].join('.') + ' (' + items[i][1] + '건) ';
                            ul.appendChild(li);
                        }
                        draw_general_popup(null, null, '접속자 아이피 리스트', ul, '닫기', null);
                    }
                });
            }
		}
		chart.draw(data, options);
	} catch(err){

	}

}
function load_statistics(){
	var data = {
		req_type : "get_analytics_statistics",
		service_id : statisticsChartData.statisticsServiceId,
		type: statisticsChartData.statisticsType,
		start: statisticsChartData.statisticsStart,
		end: statisticsChartData.statisticsEnd
	};
	remove_area_masking();
	draw_area_masking();
	$.ajax({
		url : "/requestreceiver/",
		type : "post",
		data : data,
		success : function(response, success){
			remove_area_masking();
			if(response.result == 'ok')
			{
				statisticsChartData.statisticsDataExist = response.dataExist;
				statisticsChartData.statisticsLoaded = true;
				statisticsChartData.totalPage = response.totalPage;
				statisticsChartData.totalUnique = response.totalUnique;
				statisticsChartData.totalVisitor = response.totalVisitor;

				if(statisticsChartData.totalVisitor != 0)
					statisticsChartData.pageviewAvg = Math.round(statisticsChartData.totalPage / statisticsChartData.totalVisitor * 100)/100;
				else
					statisticsChartData.pageviewAvg = 0;

				statisticsChartData.durationAvg = response.durationAvg;
				statisticsChartData.durationAvgStr = response.durationAvgStr;
				if(statisticsChartData.statisticsDataExist == false){
					load_statistics_chart();
					return;
				}
				// initialize...
				var t = statisticsChartData.unique.data[0];
				statisticsChartData.unique.data = [t];
				t = statisticsChartData.dailyVisitor.data[0];
				statisticsChartData.dailyVisitor.data = [t];
				t = statisticsChartData.pageView.data[0];
				statisticsChartData.pageView.data = [t];
				t = statisticsChartData.region.data[0];
				statisticsChartData.region.data = [t];
				t = statisticsChartData.referral.data[0];
				statisticsChartData.referral.data = [t];
				t = statisticsChartData.page.data[0];
				statisticsChartData.page.data = [t];
				t = statisticsChartData.keyword.data[0];
				statisticsChartData.keyword.data = [t];

				var dailyVisitor = response.dailyVisitor;
				var unique = response.unique;
				var pageView = response.pageView;

				for(var i = 0; i < dailyVisitor.length; i++)
					statisticsChartData.dailyVisitor.data.push(dailyVisitor[i]);
				for(var i = 0; i < unique.length; i++)
					statisticsChartData.unique.data.push(unique[i]);
				for(var i = 0; i < pageView.length; i++)
					statisticsChartData.pageView.data.push(pageView[i]);


				statisticsChartData.device.data[1][1] = response.deviceType['D'];
				statisticsChartData.device.data[2][1] = response.deviceType['M'];
				statisticsChartData.device.data[3][1] = response.deviceType['T'];

				statisticsChartData.newReturnVisitor.data[1][1] = response.visitor['N'];
				statisticsChartData.newReturnVisitor.data[2][1] = response.visitor['R'];

				// region
				for(k in response.city){
					statisticsChartData.region.data.push([locationMain[k], response.city[k]]);
				}
				// referral
				for(k in response.ref){
					var ref = '';
					if(k == ''){
						ref = '직접';
					} else {
						ref = k;
					}
					statisticsChartData.referral.data.push([ref, response.ref[k]]);
				}
				// page
				for(k in response.page){
					statisticsChartData.page.data.push([k, response.page[k]]);
				}
				// keyword
				for(k in response.keyword){
				    var keyword = '';
				    if (k === '') {
				        keyword = '키워드 없음';
                    } else {
				        keyword = k;
                    }
					statisticsChartData.keyword.data.push([keyword, response.keyword[k]['count']]);
				}
                statisticsChartData.keyword.raw = response.keyword;
				load_statistics_chart();
			}
			else
			{
				draw_general_popup(
						null,
						null,
						null,
						stringTable.tryAgain,
						stringTable.ok,
						null
				);
			}
		},
		error : function(){
			remove_area_masking();
			draw_general_popup(
					null,
					null,
					null,
					stringTable.tryAgain,
					stringTable.ok,
					null
			);
		}
	});
}
function load_statistics_chart(){
	var summaryObj = $("#statistics-summary");

	$(summaryObj).children('#visitor-number').children('.chart-number-value').children('span').text( comma_separation(statisticsChartData.totalVisitor) );
	$(summaryObj).children('#unique-visitor-number').children('.chart-number-value').children('span').text( comma_separation(statisticsChartData.totalUnique) );
	$(summaryObj).children('#pageview-number').children('.chart-number-value').children('span').text( comma_separation(statisticsChartData.totalPage) );
	$(summaryObj).children('#pageview-avg-number').children('.chart-number-value').children('span').text( statisticsChartData.pageviewAvg );
	$(summaryObj).children('#duration-number').children('.chart-number-value').children('span').text( statisticsChartData.durationAvgStr );

	if(statisticsChartData.statisticsDataExist == false){
		$("#analytics-statistics .analytics-box .statistics-chart").hide();
		$("#analytics-statistics .analytics-box .analytics-no-data").show();
		return;
	}
	$("#analytics-statistics .analytics-box .statistics-chart").show();
	$("#analytics-statistics .analytics-box .analytics-no-data").hide();

	try{
		draw_chart(statisticsChartData.dailyVisitor);
		draw_chart(statisticsChartData.unique);
		draw_chart(statisticsChartData.pageView);
		draw_chart(statisticsChartData.region);
		draw_chart(statisticsChartData.referral);
		draw_chart(statisticsChartData.page);
		draw_chart(statisticsChartData.device);
		draw_chart(statisticsChartData.newReturnVisitor);
		draw_chart(statisticsChartData.keyword);
	} catch (err) {

	}
}
function data_range_change(obj){

	var type = $(obj).prop('id').split('-')[1];

	if(type == '9'){
		statisticsVariable.saveStr = $("#analytics-statistics .statistics-control-wrapper #statistics-data-type").children('.statistics-data-type-value').text();
		$('#jrange div').show();
		return;
	}
	if(type == statisticsChartData.statisticsType)
		return;

	statisticsChartData.statisticsType = type;
	// last thirty days
	if(type == '0') {
		var now = new Date();
		var tda = new Date(now.getTime() - (24 * 60 * 60 * 1000 * 29));
		statisticsChartData.statisticsTypeText = '20' + (tda.getYear() % 100) + '/' + (tda.getMonth() + 1) + '/' + tda.getDate() + ' ~ ' + '20' + (now.getYear() % 100) + '/' + (now.getMonth() + 1) + '/' + now.getDate();
	} else if(type == '1'){		// today
		var now = new Date();
		statisticsChartData.statisticsTypeText = $(obj).text();
	} else if(type == '2'){		// yesterday
		var now = new Date();
		var tda = new Date(now.getTime() - (24*60*60*1000));
		statisticsChartData.statisticsTypeText = $(obj).text();
	} else if(type == '3'){		// last week
		var now = new Date();
		var m = now.setDate(now.getDate() -  ((now.getDay() + 6) % 7) - 7);
		var s = now.setDate(now.getDate() - ((now.getDay() + 6) % 7) + 6);
		m = new Date(m);
		s = new Date(s);
		m = new Date(m.getFullYear(), m.getMonth(), m.getDate());
		s = new Date(s.getFullYear(), s.getMonth(), s.getDate());
		s.setHours(23);
		s.setMinutes(59);
		s.setSeconds(59);
		statisticsChartData.statisticsTypeText = $(obj).text();
		statisticsChartData.statisticsStart = '20' + (m.getYear() % 100) + '/' + (m.getMonth() + 1) + '/' + m.getDate();
		statisticsChartData.statisticsEnd = '20' + (s.getYear() % 100) + '/' + (s.getMonth() + 1) + '/' + s.getDate();

	} else if(type == '4'){		// last month
		var now = new Date();
		var first = new Date(now.getFullYear(), now.getMonth() - 1, 1);
		var last = new Date(now.getFullYear(), now.getMonth(), 0);
		last.setHours(23);
		last.setMinutes(59);
		last.setSeconds(59);
		statisticsChartData.statisticsTypeText = $(obj).text();
		statisticsChartData.statisticsStart = '20' + (first.getYear() % 100) + '/' + (first.getMonth() + 1) + '/' + first.getDate();
		statisticsChartData.statisticsEnd = '20' + (last.getYear() % 100) + '/' + (last.getMonth() + 1) + '/' + last.getDate();
	}
	$("#analytics-statistics .statistics-control-wrapper #statistics-data-type").children('.statistics-data-type-value').text(statisticsChartData.statisticsTypeText);
	load_statistics();
}
function statistics_window_size_adjustment(){
	// statistics chart
	if(statisticsChartData.statisticsLoaded == true){
		load_statistics_chart();
	}
}