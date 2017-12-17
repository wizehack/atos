module.exports = function(app, fs, mkdirp, homeDir) {
    app.post('/uploadResult/:id/:file', function(req, res) {
        var testsuiteId = req.params.id;
        var filename = req.params.file;
        var body = '';
        var path = homeDir + '/public/data' + '/' + testsuiteId;

        if (fs.existsSync(path) === false) {
            console.log('new: ' + path);
            mkdirp(path, function (err) {
                if (err) {
                    console.error(err)
                }
                else {
                    console.log('created')
                }
            });
        }

        req.on('data', function(data) {
            console.log('####data] ' + data);
            body += data;
        });

        req.on('end', function (){
            console.log('end event');

            if (fs.existsSync(path) === false) {
                console.log('new: ' + path);
                mkdirp(path, function (err) {
                    if (err) {
                        console.error(err)
                    }
                    else {
                        path = path + '/' + filename;
                        console.log('create: ' + path);
                        fs.appendFile(path, body, function() {
                            res.end();
                        });
                    }
                });
            } else {
                path = path + '/' + filename;
                if (fs.existsSync(path) === true) {
                    console.log('update: ' + path);
                    fs.unlinkSync(path);
                    fs.appendFile(path, body, function() {
                        res.end();
                    });
                } else {
                    console.log('create: ' + path);
                    fs.appendFile(path, body, function() {
                        res.end();
                    });
                }
            }
        });
    });

    app.post('/uploadResult/image/:id/:file', function (req, res) {
        var testsuiteId = req.params.id;
        var filename = req.params.file;
        var path = homeDir + '/public/data' + '/' + testsuiteId;
        var file = path + '/' + filename;
        var body = req.body;

        if (fs.existsSync(path) === false) {
            console.log('new: ' + path);
            mkdirp(path, function (err) {
                if (err) {
                    console.error(err)
                }
                else {
                    console.log('create: ' + file);
                    req.pipe(fs.createWriteStream(file));
                    res.end();
                }
            });
        } else {
            if (fs.existsSync(file) === true) {
                console.log('update: ' + file);
                fs.unlinkSync(file);
                req.pipe(fs.createWriteStream(file));
                res.end();
            } else {
                console.log('create: ' + file);
                req.pipe(fs.createWriteStream(file));
                res.end();
            }
        }
    });
};
