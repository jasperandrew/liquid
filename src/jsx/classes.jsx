class Tab {
    constructor(name, data) {
        this.name = name;
        this.data = data;

        this.extension = this.name.split('.').pop();
        this.title = this.name.split('/').pop()
        this.n =  Liquid.tabManager.tabs.length + 1;
        // this.throwin = new Throwin(name, extension, n, data);
    }

    getJSX() {
        return <TabComponent key={this.n} n={this.n} title={this.title} data={this.data}/>;
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

class TableTab extends Tab {
    constructor() {
        super();
        
    }
}

class JSONTab extends Tab {
    constructor() {
        super();
        
    }
}