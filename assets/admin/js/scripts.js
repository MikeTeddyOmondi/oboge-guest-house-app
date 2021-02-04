// let conversion_Chart = document.getElementById('customer-check-ins-Chart').getContext('2d');

// // Global Options
// Chart.defaults.global.defaultFontFamily = 'Candara';
// Chart.defaults.global.defaultFontSize = 18;
// Chart.defaults.global.defaultFontColor = '#777';

// let sales_Chart = new Chart(conversion_Chart, {
//   type:'bar', // bar, horizontalBar, pie, line, doughnut, radar, polarArea
//   data:{
//     labels:['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
//     datasets:[{
//       label:'Customers Checked-in',
//       data:[
//         28,
//         12,
//         53,
//         24,
//         41,
//         60,
//         72
//       ],
//       //backgroundColor:'green',
//       backgroundColor:[
//         'rgba(255, 99, 132, 0.6)',
//         'rgba(54, 162, 235, 0.6)',
//         'rgba(255, 206, 86, 0.6)',
//         'rgba(75, 192, 192, 0.6)',
//         'rgba(153, 102, 255, 0.6)',
//         'rgba(255, 159, 64, 0.6)',
//         'rgba(255, 99, 130, 0.6)'
//       ],
//       borderWidth:1,
//       borderColor:'#777',
//       hoverBorderWidth:3,
//       hoverBorderColor:'#000'
//     }]
//   },
//   options:{
//     title:{
//       display:true,
//       text:'Summary of Customers Checked-In Last Week [ 20-01-2021 - 26-01-2021 ]',
//       fontSize:25,
//       alignment: 'left'
//     },
//     legend:{
//       display:true,
//       position:'bottom',
//       labels:{
//         fontColor:'#000'
//       }
//     },
//     layout:{
//       padding:{
//         left:50,
//         right:0,
//         bottom:0,
//         top:0
//       }
//     },
//     tooltips:{
//       enabled:true
//     }
//   }
// });

$(function() {
  /* ChartJS
   * -------
   * Data and config for chartjs
   */
  'use strict';
  var data = {
    labels: ["2021", "2022", "2023", "2024", "2025", "2026"],
    datasets: [{
      label: 'Overall Sales',
      data: [10, 19, 3, 5, 2, 3],
      backgroundColor: [
        'rgba(255, 99, 132, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(255, 206, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)',
        'rgba(153, 102, 255, 0.2)',
        'rgba(255, 159, 64, 0.2)'
      ],
      borderColor: [
        'rgba(255,99,132,1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)'
      ],
      borderWidth: 1,
      fill: false
    }]
  };

  var options = {
    scales: {
      yAxes: [{
        ticks: {
          beginAtZero: true
        }
      }]
    },
    legend: {
      display: false
    },
    elements: {
      point: {
        radius: 0
      }
    }
  };

  var barStocksdata = {
    labels: ["Beer", "Spirits", "Wines", "RTD", "Soft Drinks", "Water"],
    datasets: [{
      label: 'Stock Level',
      data: [240, 300, 130, 50, 44, 84],
      backgroundColor: [
        'rgba(255, 99, 132, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(255, 206, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)',
        'rgba(153, 102, 255, 0.2)',
        'rgba(255, 159, 64, 0.2)'
      ],
      borderColor: [
        'rgba(255,99,132,1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)'
      ],
      borderWidth: 1,
      fill: false
    }]
  };

  var barStocksOptions = {
    scales: {
      yAxes: [{
        ticks: {
          beginAtZero: true
        }
      }]
    },
    legend: {
      display: false
    },
    elements: {
      point: {
        radius: 0
      }
    }
  };

  var doughnutPieData = {
    datasets: [{
      data: [30, 40, 30],
      backgroundColor: [
        'rgba(255, 99, 132, 0.5)',
        'rgba(54, 162, 235, 0.5)',
        'rgba(255, 206, 86, 0.5)',
        'rgba(75, 192, 192, 0.5)',
        'rgba(153, 102, 255, 0.5)',
        'rgba(255, 159, 64, 0.5)'
      ],
      borderColor: [
        'rgba(255,99,132,1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)'
      ],
    }],

    // These labels appear in the legend and in the tooltips when hovering different arcs
    labels: [
      'Revenue',
      'Expenditure',
      'Reserves',
    ]
  };
  var doughnutPieOptions = {
    responsive: true,
    animation: {
      animateScale: true,
      animateRotate: true
    }
  };
  var areaData = {
    labels: ["2020", "2021", "2022", "2023", "2024"],
    datasets: [{
      label: 'CPU Usage (GHz)',
      data: [12, 19, 3, 5, 2, 3],
      backgroundColor: [
        'rgba(255, 99, 132, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(255, 206, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)',
        'rgba(153, 102, 255, 0.2)',
        'rgba(255, 159, 64, 0.2)'
      ],
      borderColor: [
        'rgba(255,99,132,1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)'
      ],
      borderWidth: 1,
      fill: true, // 3: no fill
    }]
  };

  var areaOptions = {
    plugins: {
      filler: {
        propagate: true
      }
    }
  }

  // Get context with jQuery - using jQuery's .get() method.
  if ($("#barChart").length) {
    var barChartCanvas = $("#barChart").get(0).getContext("2d");
    // This will get the first returned node in the jQuery collection.
    var barChart = new Chart(barChartCanvas, {
      type: 'bar',
      data: barStocksdata,
      options: barStocksOptions
    });
  }

  if ($("#lineChart").length) {
    var lineChartCanvas = $("#lineChart").get(0).getContext("2d");
    var lineChart = new Chart(lineChartCanvas, {
      type: 'line',
      data: data,
      options: options
    });
  }

  if ($("#doughnutChart").length) {
    var doughnutChartCanvas = $("#doughnutChart").get(0).getContext("2d");
    var doughnutChart = new Chart(doughnutChartCanvas, {
      type: 'doughnut',
      data: doughnutPieData,
      options: doughnutPieOptions
    });
  }

  if ($("#pieChart").length) {
    var pieChartCanvas = $("#pieChart").get(0).getContext("2d");
    var pieChart = new Chart(pieChartCanvas, {
      type: 'pie',
      data: doughnutPieData,
      options: doughnutPieOptions
    });
  }

  if ($("#areaChart").length) {
    var areaChartCanvas = $("#areaChart").get(0).getContext("2d");
    var areaChart = new Chart(areaChartCanvas, {
      type: 'line',
      data: areaData,
      options: areaOptions
    });
  }
});