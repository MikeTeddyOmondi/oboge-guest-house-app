let conversion_Chart = document.getElementById('customer-check-ins-Chart').getContext('2d');

// Global Options
Chart.defaults.global.defaultFontFamily = 'Candara';
Chart.defaults.global.defaultFontSize = 18;
Chart.defaults.global.defaultFontColor = '#777';

let sales_Chart = new Chart(conversion_Chart, {
  type:'bar', // bar, horizontalBar, pie, line, doughnut, radar, polarArea
  data:{
    labels:['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    datasets:[{
      label:'Customers Check-in',
      data:[
        28,
        12,
        53,
        24,
        41,
        60,
        72
      ],
      //backgroundColor:'green',
      backgroundColor:[
        'rgba(255, 99, 132, 0.6)',
        'rgba(54, 162, 235, 0.6)',
        'rgba(255, 206, 86, 0.6)',
        'rgba(75, 192, 192, 0.6)',
        'rgba(153, 102, 255, 0.6)',
        'rgba(255, 159, 64, 0.6)',
        'rgba(255, 99, 130, 0.6)'
      ],
      borderWidth:1,
      borderColor:'#777',
      hoverBorderWidth:3,
      hoverBorderColor:'#000'
    }]
  },
  options:{
    title:{
      display:true,
      text:'Summary of Customers Checked-In Last Week [ 20-01-2021 - 26-01-2021 ]',
      fontSize:25,
      alignment: 'left'
    },
    legend:{
      display:true,
      position:'bottom',
      labels:{
        fontColor:'#000'
      }
    },
    layout:{
      padding:{
        left:50,
        right:0,
        bottom:0,
        top:0
      }
    },
    tooltips:{
      enabled:true
    }
  }
});
