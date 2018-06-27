/* global Highcharts, $, document, getAjax, deleteAjax */
/* eslint no-unused-vars: 0 */

(function main() {
  const container1 = document.getElementById('container1');
  const networkId = container1.dataset.id;
  getAjax(`/api/network/${networkId}`, (json) => {
    const network = JSON.parse(json);
    const entries = network.trainingIterations.length;
    const trainingErrors = [];
    const truePositive = [];
    const falseNegative = [];
    const trueNegative = [];
    const falsePositive = [];
    const accuracy = [];
    const errorRate = [];
    const sensitivity = [];
    const specificity = [];
    const precision = [];
    for (let i = 0; i < entries; i++) {
      const iteration = network.trainingIterations[i];
      const errors = network.trainingErrors[i];
      const TN = network.trueNegative[i];
      const TP = network.truePositive[i];
      const FN = network.falseNegative[i];
      const FP = network.falsePositive[i];
      trainingErrors.push([iteration, errors]);
      truePositive.push([iteration, TP]);
      falseNegative.push([iteration, FN]);
      trueNegative.push([iteration, TN]);
      falsePositive.push([iteration, FP]);
      accuracy.push([iteration, (TP + TN) / (TP + TN + FP + FN)]);
      errorRate.push([iteration, (FP + FN) / (TP + TN + FP + FN)]);
      sensitivity.push([iteration, TP / (TP + FN)]);
      specificity.push([iteration, TN / (TN + FP)]);
      precision.push([iteration, TP / (TP + FP)]);
      if (i === entries - 1) {
        pieChart('container3', [TP, FN, TN, FP], ['True Positive', 'False Negative', 'True Negative', 'False Positive']);
      }
    }
    areaChart(
      'container2',
      [truePositive, falseNegative, trueNegative, falsePositive],
      ['True Positive', 'False Negative', 'True Negative', 'False Positive'],
    );
    lineChart(
      'container1',
      [trainingErrors, accuracy, errorRate, sensitivity, specificity, precision],
      ['Training Error', 'Accuracy', 'Error Rate', 'Sensitivity', 'Specificity', 'Precision'],
      // `Network ID: ${ID}`,
    );
    // const svgContainer = document.getElementById('svg-container');
    // const optionsContainer = document.getElementById('svg-container');
    // const graphContainer = document.getElementById('graph-container');
    // graphContainer.width = svgContainer.clientWidth - 30; // - padding
    // graphContainer.height = optionsContainer.clientHeight;
    networkGraph(`../api/net-json-graph/${network.jsonStringID[entries - 1]}`);
  });
}());

function lineChart(containerId, data, name, title) {
  // console.time('line');
  const series = [];
  for (let i = 0; i < data.length; i++) {
    series.push({
      data: data[i],
      lineWidth: 2.5,
      name: name[i],
    });
  }
  Highcharts.chart(containerId, {
    chart: { type: 'line', zoomType: 'x' },
    title: { text: title || null },
    // title: { text: title },
    series,
    navigation: {
      buttonOptions: {
        verticalAlign: 'bottom',
        y: -20,
      },
    },
  });
  // console.timeEnd('line');
}

function areaChart(containerId, data, name, title) {
  // console.time('line');
  const series = [];
  for (let i = 0; i < data.length; i++) {
    series.push({
      data: data[i],
      lineWidth: 2.5,
      name: name[i],
    });
  }
  Highcharts.chart(containerId, {
    chart: {
      type: 'area',
      zoomType: 'x',
    },
    title: { text: title || null },
    yAxis: { title: { text: 'Percent' } },
    tooltip: {
      pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.percentage:.1f}%</b> ({point.y:,.0f})<br/>',
      split: true,
    },
    plotOptions: {
      area: {
        // stacking: 'normal',
        stacking: 'percent',
        lineColor: '#666666',
        lineWidth: 1,
        marker: { lineWidth: 1, lineColor: '#666666' },
      },
    },
    series,
    navigation: {
      buttonOptions: {
        verticalAlign: 'bottom',
        y: -20,
      },
    },
  });
  // console.timeEnd('line');
}

function pieChart(containerId, dataset, name, title) {
  const data = [];
  for (let i = 0; i < dataset.length; i++) {
    data.push({
      name: name[i],
      y: dataset[i],
    });
  }
  Highcharts.chart(containerId, {
    chart: {
      // plotBackgroundColor: null,
      // plotBorderWidth: null,
      // plotShadow: false,
      type: 'pie',
    },
    title: { text: title || null },
    tooltip: {
      // headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
      pointFormat: '<b>{point.y}</b> ({point.percentage:.2f}% of total)<br/>',
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: {
          enabled: true,
          format: '<b>{point.name}</b>: {point.percentage:.2f} %',
          // style: {
          //   color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black',
          // },
        },
      },
    },
    series: [{
      // name: 'Brands', FOR TOOLTIP LEGEND
      // colorByPoint: true,
      data,
    }],
    navigation: {
      buttonOptions: {
        verticalAlign: 'bottom',
        y: -20,
      },
    },
  });
}

$('#delete-modal').on('show.bs.modal', (event) => {
  const deleteBtn = $(event.relatedTarget);
  const networkId = deleteBtn.data('id');
  const title = document.getElementById('delete-modal-title');
  const text = document.getElementById('confirmation-text');
  const confirmBtn = document.getElementById('confirm-btn');
  const cancelBtn = document.getElementById('cancel-btn');
  title.innerText = `Delete Network ${networkId}`;
  text.innerText = `Are you sure you want to delete Network ${networkId}?`;
  function deleteNetwork() {
    deleteAjax(`/api/network/${networkId}`, (json) => {
      document.getElementById('response-modal-title').innerText = JSON.parse(json).message;
    });
  }
  confirmBtn.addEventListener('click', deleteNetwork, false);
  cancelBtn.addEventListener('click', () => {
    confirmBtn.removeEventListener('click', deleteNetwork);
  });
  $('#delete-modal').on('hidden.bs.modal', () => {
    confirmBtn.removeEventListener('click', deleteNetwork);
  });
});
