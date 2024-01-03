function buildMetadata(sample) {
  d3.json("/metadata/" + sample).then((sample_data) => {
    var sample_panel = d3.select("#sample-metadata");

    sample_panel.html("");

    Object.entries(sample_data).forEach(([key, value]) => {
      sample_panel.append().html(`<h4><strong>${key}:</strong> ${value}</h4>`);
    });
  });
}

function buildCharts(sample) {
  d3.json("/samples/" + sample).then(function (sample_data) {
    var ids = sample_data.otu_ids.slice(0, 10);
    var labels = sample_data.otu_labels.slice(0, 10);
    var values = sample_data.sample_values.slice(0, 10);

    var pie_data = [
      {
        type: "pie",
        labels: ids,
        hovertext: labels,
        values: values,
        hole: 0.5,
      },
    ];

    var pie_layout = {
      colorway: [
        "#87CEEB",
        "#00BFFF",
        "#1E90FF",
        "#0000FF",
        "#191970",
        "#8A2BE2",
        "#4B0082",
        "#DB7093",
        "#E6E6FA",
        "#FF00FF",
      ],
      height: 500,
      width: 500,
    };

    Plotly.newPlot("pie", pie_data, pie_layout);
  });

  d3.json("/wfreq/" + sample).then(function (sample_data) {
    Highcharts.chart("gauge", {
      chart: {
        type: "gauge",
        plotBackgroundColor: null,
        plotBackgroundImage: null,
        plotBorderWidth: 0,
        plotShadow: false,
        height: "80%",
      },

      title: {
        text: "Bully button washing frequency",
      },

      pane: {
        startAngle: -90,
        endAngle: 89.9,
        background: null,
        center: ["50%", "75%"],
        size: "110%",
      },

      // the value axis
      yAxis: {
        min: 0,
        max: 9,
        tickPixelInterval: 72,
        tickPosition: "inside",
        tickColor: Highcharts.defaultOptions.chart.backgroundColor || "#FFFFFF",
        tickLength: 20,
        tickWidth: 2,
        minorTickInterval: null,
        labels: {
          distance: 20,
          style: {
            fontSize: "14px",
          },
        },
        lineWidth: 0,
        plotBands: [
          {
            from: 0,
            to: 3,
            color: "#87CEEB",
            thickness: 20,
          },
          {
            from: 3,
            to: 6,
            color: "#00BFFF",
            thickness: 20,
          },
          {
            from: 6,
            to: 9,
            color: "#1E90FF",
            thickness: 20,
          },
        ],
      },

      series: [
        {
          name: "Washes per Week",
          data: [sample_data || 0],
          tooltip: {
            valueSuffix: " washes per week",
          },
          dataLabels: {
            format: "{y} washes per week",
            borderWidth: 0,
            color:
              (Highcharts.defaultOptions.title &&
                Highcharts.defaultOptions.title.style &&
                Highcharts.defaultOptions.title.style.color) ||
              "#333333",
            style: {
              fontSize: "16px",
            },
          },
          dial: {
            radius: "80%",
            backgroundColor: "gray",
            baseWidth: 12,
            baseLength: "0%",
            rearLength: "0%",
          },
          pivot: {
            backgroundColor: "gray",
            radius: 6,
          },
        },
      ],
    });
  });

  d3.json("/samples/" + sample).then(function (sample_data) {
    var ids = sample_data.otu_ids;
    var labels = sample_data.otu_labels;
    var values = sample_data.sample_values;

    var trace = [
      {
        x: ids,
        y: values,
        text: labels,
        mode: "markers",
        marker: {
          size: values,
          color: ids,
          colorscale: "Blues",
        },
      },
    ];

    Plotly.newPlot("bubble", trace);
  });
}

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("li")
        .text(sample)
        .attr("data-value", sample)
        .attr(
          "class",
          "sample block w-full px-4 py-2 border-b border-gray-200 cursor-pointer hover:bg-gray-100 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:border-gray-600 dark:hover:bg-gray-600 dark:hover:text-white dark:focus:ring-gray-500 dark:focus:text-white"
        );
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];

    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

document.querySelector("#selDataset").addEventListener("click", (event) => {
  event.stopPropagation();

  const target = event.target;
  const newSample = Number(target.getAttribute("data-value"));

  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
});

// Initialize the dashboard
init();
