"""
 * DataEntry 2.0.0 Flask development server
 * https://github.com/RobertoPrevato/DataEntry
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
"""
import os
import json
from flask import Flask, request, render_template, make_response

# set the project root directory as the static folder, you can set others.
root_dir = os.path.dirname(os.getcwd())
rel = os.path.join(root_dir, "..", "httpdocs")
pat = os.path.abspath(rel)
app = Flask(__name__, static_folder=pat)

# set debug to true (this is useful while developing client side code because it gives hot refresh of server)
# however, set it to false when you desire to debug Python code in PyCharm!
app.debug = True
PORT = 44556

#   {{ resources("sharedjs")|safe }}
plain_text = {"Content-Type": "text/plain"}
json_type = {"Content-Type": "application/json"}
bad_request = ("Bad Request", 400, plain_text)


def get_json_response(data):
    res = make_response(json.dumps(data, indent=4))
    res.mimetype = "application/json"
    max_age = 60*15
    res.headers.add("Cache-Control", "max-age=%s" % max_age)
    return res


@app.route("/")
def root():
    return render_template("index.html")


@app.route("/tests")
def tests():
    return render_template("tests.html")


@app.route("/<path:path>")
def static_proxy(path):
    return app.send_static_file(path)


if __name__ == "__main__":
    # send_static_file will guess the correct MIME type
    print("...serving static files from: {}".format(pat))
    app.run(port=PORT, threaded=True)
