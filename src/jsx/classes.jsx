class Tab {
    constructor(name, extension, rawdata) {
        this.name = name;
        this.rawdata = rawdata;

        this.file_type = null;
        this.title = this.name.split('/').pop();
        this.id =  Liquid.tabManager.tabs.length + 1;
        this.tab_type = null;
    }

    getName() { return this.name; }

    getRawData() { return this.rawdata; }

    getExtension() { return this.extension; }

    getID() {return this.id; }
    
    getType() { return this.type; }

    getComponent() {
        return <TabComponent key={this.id} n={this.id} title={this.title} rawdata={this.rawdata} type={this.type}/>;
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

class TextTab extends Tab {
    constructor(name, extension, rawdata) {
        super(name, extension, rawdata);
        this.type = 'text';
    }
}

class TableTab extends Tab {
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
}

class JSONTab extends Tab {
    constructor(name, extension, rawdata) {
        super(name, extension, rawdata);
        this.type = 'json';
        this.object = null;
    }
}

class JSONSelectTab extends JSONTab {
    constructor(name, extension, rawdata) {
        super(name, extension, rawdata);
        this.type = 'json_select';
        this.object = null;
    }
}