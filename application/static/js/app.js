function buildMetadata(sample) {

  d3.json('/metadata/'+ sample).then((sample_data) => {

    var sample_panel = d3.select('#sample-metadata');

    sample_panel.html("");

    Object.entries(sample_data).forEach(([key, value]) => {
      sample_panel.append().html(`<h4><strong>${key}:</strong> ${value}</h4>`);
    });
  });
}

function buildCharts(sample) {

  d3.json('/samples/' + sample).then(function(sample_data){

  var ids = sample_data.otu_ids.slice(0,10);
  var labels = sample_data.otu_labels.slice(0,10);
  var values = sample_data.sample_values.slice(0,10);

  var pie_data = [{
    type: 'pie',
    labels: ids,
    hovertext: labels,
    values: values,
    hole: .5 
  }];

  var pie_layout = {
    colorway : ['#87CEEB', '#00BFFF', '#1E90FF', '#0000FF', '#191970', '#8A2BE2', '#4B0082', '#DB7093', '#E6E6FA', '#FF00FF'],
    height: 500,
    width: 500,
  };

  Plotly.newPlot('pie', pie_data, pie_layout);
})

  d3.json('/samples/' + sample).then(function(sample_data){
    
    var ids = sample_data.otu_ids;
    var labels = sample_data.otu_labels;
    var values = sample_data.sample_values;

    var trace = [{
      x: ids,
      y: values,
      text: labels,
      mode: 'markers',
      marker: {
        size: values,
        color: ids,
        colorscale: "Blues"
      }
    }];

    Plotly.newPlot('bubble', trace);
  }) }



function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
init();

