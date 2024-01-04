function buildMetadata(sample) {
  d3.json("/metadata/" + sample).then((sample_data) => {
    const { ETHNICITY, GENDER, AGE, BBTYPE } = sample_data;
    var ageElement = d3.select("#age");
    var genderElement = d3.select("#gender");
    var ethnicityElement = d3.select("#ethnicity");
    var bbType = d3.select("#bbtype");

    ageElement.html("");
    genderElement.html("");
    ethnicityElement.html("");
    bbType.html("");

    ageElement.append("p").html(`<strong>Age:</strong> ${AGE}`);
    genderElement.append("p").html(`<strong>Gender:</strong> ${GENDER}`);
    ethnicityElement
      .append("p")
      .html(`<strong>Ethnicity:</strong> ${ETHNICITY}`);
    bbType.append("p").html(`<strong>Belly Button Type:</strong> ${BBTYPE}`);
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
      title: "Bacteria",
      font: {
        family: "Inconsolata-Regular",
        color: "white",
      },
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
      height: 450,
      width: 450,
    };

    Plotly.newPlot("pie", pie_data, pie_layout, { responsive: true });
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
        style: {
          fontFamily: "Inconsolata-Regular",
          color: "white",
        },
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
        tickColor: "white",
        tickLength: 20,
        tickWidth: 2,
        minorTickInterval: null,
        labels: {
          distance: 20,
          style: {
            fontSize: "14px",
            color: "white",
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
            color: "white",
            style: {
              fontSize: "16px",
              fontFamily: "Inconsolata-Regular",
            },
          },
          dial: {
            radius: "80%",
            backgroundColor: "white",
            baseWidth: 12,
            baseLength: "0%",
            rearLength: "0%",
          },
          pivot: {
            backgroundColor: "white",
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
          colorscale: "Bluered",
        },
      },
    ];

    var bubble_layout = {
      title: "Bacteria",
      font: {
        family: "Inconsolata-Regular",
        color: "white",
      },
    };

    Plotly.newPlot("bubble", trace, bubble_layout, { responsive: true });
  });
}

function init() {
  // Grab a reference to the sample list element
  var selector = d3.select("#sample-list");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      const li = document.createElement("li");

      li.setAttribute("data-value", sample);
      li.setAttribute("class", "sample");
      li.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 -960 960 960"><path d="M400-720q-33 0-56.5-23.5T320-800q0-33 23.5-56.5T400-880q33 0 56.5 23.5T480-800q0 33-23.5 56.5T400-720Zm260 480q42 0 71-29t29-71q0-42-29-71t-71-29q-42 0-71 29t-29 71q0 42 29 71t71 29ZM864-80 756-188q-22 14-46 21t-50 7q-75 0-127.5-52.5T480-340q0-75 52.5-127.5T660-520q75 0 127.5 52.5T840-340q0 26-7 50t-21 46l108 108-56 56Zm-424 0v-121q15 24 35.5 44t44.5 36v41h-80Zm-160 0v-520q-61-5-121-14.5T40-640l20-80q84 23 168.5 31.5T400-680q87 0 171.5-8.5T740-720l20 80q-59 16-119 25.5T520-600v41q-54 35-87 92.5T400-340v10q0 5 1 10h-41v240h-80Z"/></svg><p>${sample}</p>`;

      selector.append(() => li);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];

    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

document.querySelector("#sample-list").addEventListener("click", (event) => {
  const target = event.target;
  const newSample = Number(target.getAttribute("data-value"));

  if (newSample) {
    // Fetch new data each time a new sample is selected
    buildCharts(newSample);
    buildMetadata(newSample);
  }
});

// Initialize the dashboard
init();
