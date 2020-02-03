class Throwin {
    constructor(name, extension, rawdata) {
        this.name = name;
        this.rawdata = rawdata;
        this.extension = extension;
        this.title = this.name.split('/').pop();
        this.id =  DATA.Throwin.data.length + 1;
        this.type = null;
    }

    getName() { return this.name; }

    getExtension() { return this.extension; }

    getFullName() { return this.name + '.' + this.extension; }

    getRawData() { return this.rawdata; }

    getID() {return this.id; }

    getType() { return this.type; }

    getThrowinComponent() {
        return <ThrowinComponent key={this.id} n={this.id} title={this.title} rawdata={this.rawdata} type={this.type}/>;
    }

    download() {
        saveAs(
            new Blob([this.rawdata], {type: "text/plain;charset=utf-8"}),
            this.getFullName()
        );
    }

    static getFormat(extension) {
        switch(extension){
            case 'json_select':
                return 'json_select';
            case 'tsv':
                return 'table';
            // case 'txt':
            // case 'sql':
            default:
                return 'text';
        }
    }
}

class TextThrowin extends Throwin {
    constructor(name, extension, rawdata) {
        super(name, extension, rawdata);
        this.type = 'text';
    }
}

class TableThrowin extends Throwin {
    constructor(name, extension, rawdata) {
        super(name, extension, rawdata);
        this.type = 'table';
        this.object = null;
        this.rawdata = {
            cols: [],
            rows: rawdata.rows
        };
        if(typeof(rawdata.cols[0]) === "string"){ // Temporary check to see if cols are string or object
            rawdata.cols.forEach(col => this.rawdata.cols.push({ title:col, field:col, editor:true }));
        }else{
            this.rawdata.cols = rawdata.cols;
        }
    }

    getTableObject() { return this.object; }

    setTableObject(object) { this.object = object; }

    // Overload
    download() {
        let delim = ',';
        if(this.extension === 'tsv') delim = '\t';
        this.object.download('csv', this.getFullName(), {delimiter:delim});
    }
}

class JSONThrowin extends Throwin {
    constructor(name, extension, rawdata) {
        super(name, extension, rawdata);
        this.type = 'json';
        this.object = null;
    }
}

class JSONSelectThrowin extends JSONThrowin {
    constructor(name, extension, rawdata) {
        super(name, extension, rawdata);
        this.type = 'json_select';
        this.object = null;
    }
}

class WebPageThrowin extends Throwin {
    constructor(name, extension, rawdata) {
        super(name, extension, rawdata);
        this.type = 'webpage';
    }
}