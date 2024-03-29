# Third Party
import pandas as pd
from sqlalchemy.ext.automap import automap_base
from flask import Flask, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy

# Custom
from modules.logger import logger


# Create base model class
Base = automap_base()

DB = SQLAlchemy()

application = Flask(__name__)
application.config["DEBUG"] = True
application.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///../db/bellybutton.sqlite"
application.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

DB.init_app(application)

with application.app_context():
    # reflect the tables
    Base.prepare(autoload_with=DB.engine)

# Save references to each table
Samples_Metadata = Base.classes.sample_metadata
Samples = Base.classes.samples


@application.route("/")
def index():
    """Return the homepage."""
    logger.info("Homepage requested")

    return render_template("index.html")


@application.route("/names")
def names():
    """Return a list of sample names."""
    logger.info("Names requested")

    try:
        # Use Pandas to perform the sql query
        stmt = DB.session.query(Samples).statement
        df = pd.read_sql_query(stmt, DB.engine)

        # Return a list of the column names (sample names)
        return jsonify(list(df.columns)[2:])
    except Exception as e:
        logger.exception(f"Error getting sample names: {e}")

        return render_template("error.html")


@application.route("/metadata/<sample>")
def sample_metadata(sample):
    """Return the MetaData for a given sample."""
    logger.info(f"Metadata requested for sample {sample}")

    try:
        sel = [
            Samples_Metadata.sample,
            Samples_Metadata.ETHNICITY,
            Samples_Metadata.GENDER,
            Samples_Metadata.AGE,
            Samples_Metadata.LOCATION,
            Samples_Metadata.BBTYPE,
            Samples_Metadata.WFREQ,
        ]

        results = DB.session.query(*sel).filter(Samples_Metadata.sample == sample).all()

        # Create a dictionary entry for each row of metadata information
        sample_metadata = {}

        for result in results:
            sample_metadata["ETHNICITY"] = result[1]
            sample_metadata["GENDER"] = result[2]
            sample_metadata["AGE"] = result[3]
            sample_metadata["LOCATION"] = result[4]
            sample_metadata["BBTYPE"] = result[5]

        return jsonify(sample_metadata)
    except Exception as e:
        logger.exception(f"Error getting sample metadata: {e}")

        return render_template("error.html")


@application.route("/samples/<sample>")
def samples(sample):
    """Return `otu_ids`, `otu_labels`,and `sample_values`."""
    logger.info(f"Sample data requested for sample {sample}")

    try:
        stmt = DB.session.query(Samples).statement
        df = pd.read_sql_query(stmt, DB.engine)

        # Filter the data based on the sample number and
        # only keep rows with values above 1
        sample_data = df.loc[df[sample] > 1, ["otu_id", "otu_label", sample]]
        # Format the data to send as json
        data = {
            "otu_ids": sample_data.otu_id.values.tolist(),
            "sample_values": sample_data[sample].values.tolist(),
            "otu_labels": sample_data.otu_label.tolist(),
        }

        return jsonify(data)
    except Exception as e:
        logger.exception(f"Error getting samples: {e}")

        return render_template("error.html")


@application.route("/wfreq/<sample>")
def wfreq(sample):
    """Return the Weekly Washing Frequency for given sample / person."""

    logger.info(f"WFREQ requested for sample {sample}")

    try:
        # Returns [(float,)] or [(None,)] if no sample found
        results = (
            DB.session.query(Samples_Metadata.WFREQ)
            .filter(Samples_Metadata.sample == sample)
            .all()
        )

        # Index into array > tuple to get float representing wfreq
        wfreq = results[0][0]

        return jsonify(wfreq)
    except Exception as e:
        logger.exception(f"Error getting washing frequency: {e}")

        return render_template("error.html")


if __name__ == "__main__":
    application.run(host="0.0.0.0", port=5000)
