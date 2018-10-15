var tables = [];
tables[0] = new Tabulator("#table1", {
    height:"311px",
    layout:"fitData",
    placeholder:"No Data Set",
    columns:[]
});
tables[1] = new Tabulator("#table2", {
    height:"311px",
    layout:"fitData",
    placeholder:"No Data Set",
    columns:[]
});
tables[2] = new Tabulator("#table3", {
    height:"311px",
    layout:"fitData",
    placeholder:"No Data Set",
    columns:[]
});

function loadTableData(url, tableIdx){
    var data = [], cols = [];

    fetch(url)
        .then(response => response.json())
        .then(json => json.forEach(row => {
            data.push(row);
        }))
        .then(function(){
            for(item in data[0]){
                if(typeof(data[0][item]) === "object"){
                    var subcols = [];
                    for(i in data[0][item]){
                        subcols.push({title:i, field:item + '.' + i});
                    }
                    cols.push({ title:item, columns:subcols });
                }else{
                    cols.push({ title:item, field:item });
                }
            }

            tables[tableIdx].setColumns(cols);
            tables[tableIdx].setData(data)
        });
}

function redrawTable(){
    console.log(this.classList[0].slice(-1)-1)
    tables[this.classList[0].slice(-1)-1].redraw(true);
    this.removeEventListener('click', redrawTable);
}

document.querySelector("#load").addEventListener('click', function(){
    loadTableData('https://jsonplaceholder.typicode.com/users', 0);
    loadTableData('https://jsonplaceholder.typicode.com/posts', 1);
    loadTableData('https://jsonplaceholder.typicode.com/comments', 2);

    // document.querySelector('li.table1').addEventListener('click', redrawTable);
    // document.querySelector('li.table2').addEventListener('click', redrawTable);
    // document.querySelector('li.table3').addEventListener('click', redrawTable);
});

// window.addEventListener('resize', function(){
//     tables[0].redraw();
//     tables[1].redraw();
//     tables[2].redraw();
// });