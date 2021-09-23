(function ($, window, document) {
  $(async function () {
    //   const socket = io();
    const DELETE = "delete";
    const SUCCESS = "success";
    const FAILED = "failed";
    const NOT_EXISTS = "not exists";
    const RUNNING = "running";
    const NOT_FOUND = "not found";
    const NOT_CSV = "not CSV";
    let stop = false;
    let index = 1;
    let dataSet = [];
    var table = $('#tbl-content').DataTable({
      columnDefs: [{
        "defaultContent": "-",
        "targets": "_all"
      }],
      data: dataSet,
      order: [[ 0, "asc" ]],
      columns: [
        { data: 'no' },
        { data: 'bukken_id' },
        { data: 'keyword', className: 'text-left-custom' },
        { data: 'status', className: 'text-center'},
        { data: 'total', className: 'text-right-custom'},
        { data: 'action', className: 'text-center' }
    ]
    });
    document.getElementById("submit").disabled = true;
  
    function getStatusBadge(status) {
      switch (status) {
        case FAILED:
          return `<span class="badge badge-danger">${status}</span>`;
        case SUCCESS:
          return `<span class="badge badge-success">${status}</span>`;
        case RUNNING:
          return `<span class="badge badge-warning">${status}</span>`;
        default:
          return `<span class="badge badge-default">${status}</span>`;
      }
    }

    function getActionButton(status, fileName) {
      if (status === SUCCESS) {
        return `
          <button type="button" id="download" class="btn btn-outline-primary" data-action="start" title="${fileName}">
            <i class="fa fa-file-download"></i>
          </button>
      `;
      //<button type="button" id="delete-confirm" class="btn btn-outline-danger" data-action="delete" title="Delete File">
      // <i class="fa fa-trash-alt"></i>
      // </button>
      }
      return `<div></div>`
    }

    function showModal(status, message) {
      $('#exampleModal').modal('show');
      // default show modal error
      $('#exampleModalLabel').html(`<div class="text-danger">Something went wrong.</div>`)
      $('#messageModal').text("Sorry, something went wrong there. Try again.")
      $('#modal-button').html(`<button type="button" class="btn btn-primary" data-dismiss="modal">Close</button>`);
      // modal confirm delete
      if (status === DELETE) {
        $('#exampleModalLabel').html(`<div class="text-danger">Are you sure?</div>`);
        $('#messageModal').text("Do you really want to delete these records? This process cannot be undone.");
        $('#modal-button').html(`
        <button type="button" class="btn btn-primary" data-dismiss="modal">Cancel</button>
        <button type="button" id="delete-file" class="btn btn-danger">Delete</button>
        `);
      }
      if (status === SUCCESS) {
        $('#exampleModalLabel').html(`<div class="text-success">File deleted</div>`);
        $('#messageModal').text("File "+ message + " is successfully deleted.");
      }
      if (status === FAILED) {
        $('#exampleModalLabel').text("Deleting File Failed");
        if (message === NOT_EXISTS) {
          $('#messageModal').text("File does not exist or has been deleted, please try again affter refreshing.");
        } else {
          $('#messageModal').text("We ran into errors deleting this file (please try again in a few minutes).");
        }
      }
      if (status === NOT_FOUND) {
        $('#exampleModalLabel').html(`<div class="text-warning">Not Found</div>`);
        $('#messageModal').text("No found data with keyword!")
      }
      if (status === NOT_CSV) {
        $('#exampleModalLabel').html(`<div class="text-warning">No correct file csv</div>`);
        $('#messageModal').text("Please choose file csv and try again!")
      }
    }

    $(document).on('click', '#download', function () {
      // console.log(this.title);
      window.open(`/download/${this.title}`, '_blank').focus();
      // window.location.href=`/download/${this.title}`;
    });
    
    $(document).on('click', '#delete-confirm', function () {
      showModal(DELETE, "");
    });

    $(document).on('click', '#delete-file',async function () {
      try {
        dataRs = await fetch('/delete-file',  {
          method: 'POST',
          body: JSON.stringify({fileName: 'data'}),
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
        }).then(response => response.json())
        .then((body) => {
          showModal(SUCCESS, body.fileName);
          $('#exampleModal').modal('show');
        });
      } catch (error) {
        console.log(error)
        showModal("", "")
      }
    });

    

    const inputFile = document.getElementById('input')
    inputFile.addEventListener('change', function() {
      try {
        const reader = new FileReader();
        reader.onload = function (event) {
          // set data csv to textarea
          document.getElementById('keywordsText').value =  event.target.result;
          document.getElementById("submit").disabled = false;
        };
        if (inputFile.files[0]) {
          // check type file === .csv
          if ((inputFile.files[0].name).substring(inputFile.files[0].name.length - 4) === ".csv") {
            reader.readAsText(inputFile.files[0]);
          } else {
            showModal(NOT_CSV, "");
          }
        }
      } catch (error) {
        document.getElementById("submit").disabled = true;
        console.log(error)
      }
    })

    function replaceAll(str, find, replace) {
      return str.replace(new RegExp(find, 'g'), replace);
    }

    // call api backend
    async function crawlData(dataObj) {
      try {
        await fetch('/home',  {
          method: 'POST',
          body: JSON.stringify(dataObj),
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
        }).then(response => response.json())
        .then((body) => {
          let sum = body.sum;
          document.getElementById("submit").disabled = false;

          obj = {
            no: dataObj.no,
            bukken_id: dataObj.bukken_id,
            keyword: dataObj.keyword,
            status: getStatusBadge(SUCCESS),
            total: sum,
            action: sum === 0 ? getActionButton(FAILED) : getActionButton(SUCCESS, body.fileName)
            // fileName: body.fileName
          }
          //draw table
          dataSet[dataSet.length - 1] = obj;
          table.clear();
          table.rows.add(dataSet);
          table.draw();
        });
      } catch (error) {
        console.log(error);
        document.getElementById("submit").disabled = false;
        obj = {
          no: dataObj.no,
          bukken_id: dataObj.bukken_id,
          keyword: dataObj.keyword,
          status: getStatusBadge(FAILED),
          total: 0,
          action: getActionButton(FAILED, "")
        }
        //draw table
        dataSet[dataSet.length - 1] = obj;
        table.clear();
        table.rows.add(dataSet);
        table.draw();
        showModal("", "");
      }
      stop = false;
      index++;
    }

    // onclick button start
    $(document).on('click', '#submit', async function () {
      try {
        document.getElementById("submit").disabled = true;
        const data = $('form').serializeArray();
        let keyword = "";
        let location = "";
        let dayPosted = "";
        data.forEach(itemForm => {
          if (itemForm.name == "keyword") {
            keyword = itemForm.value;
          } else if (itemForm.name == "location") {
            location = itemForm.value;
          } else {
            dayPosted = itemForm.value;
          }
        });
        const arrTextarea = keyword.split("\r\n");
        let arrayKeywords;
        let dataObj;
        index = 1;
        stop = false;
        let obj = {};
        table.clear();
        dataSet = [];
        let bukken_id = "";
        let no = 1;
        while (index != arrTextarea.length) {
          if (!stop) {
            stop = true;
            arrayKeywords = arrTextarea[index].split(",");
            let keywordReq = "";
            if (arrayKeywords[1] || arrayKeywords[2]) {
              keywordReq = (arrayKeywords[1] + "　" + arrayKeywords[2]).replaceAll("\"", "");
            }
            if (keywordReq && keywordReq !== "") {
              no = arrayKeywords[0];
              bukken_id = arrayKeywords[3];
              dataObj = {
                no: no,
                keyword: keywordReq,
                bukken_id: bukken_id,
                location: location,
                dayPosted: dayPosted
              };
              
              // draw table
              obj = {
                no: arrayKeywords[0],
                keyword: dataObj.keyword,
                status: getStatusBadge(RUNNING),
                total: 0,
                action: getActionButton(RUNNING, "")
              }
              dataSet.push(obj);
              table.clear();
              table.rows.add(dataSet);
              table.draw();

              await crawlData(dataObj);
            } else {
              stop = false;
              index++;
            }
          }
        }
      } catch (error) {
        console.error(error);
        document.getElementById("submit").disabled = false;
        showModal("", "");
      }
      
    });
  });
}(window.jQuery, window, document));
  