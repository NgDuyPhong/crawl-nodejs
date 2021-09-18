(function ($, window, document) {
    $(async function () {
    //   const socket = io();
  
      function getStatusBadge(status) {
        switch (status) {
          case "error":
            return `<span class="badge badge-danger">${status}</span>`;
          case "stopped":
            return `<span class="badge badge-success">${status}</span>`;
          case "online":
            return `<span class="badge badge-warning">${status}</span>`;
          default:
            return `<span class="badge badge-default">${status}</span>`;
        }
      }
  
      function getActionButton(status) {
        if (status === "stopped") {
          return `
            <button type="button" id="getCsv" class="btn btn-outline-primary" data-action="start" title="download">
              <i class="fa fa-file-download"></i>
            </button>
        `;
        }
        return `<div></div>`
        
      }
  
      async function updateMinersStatus(miner) {
        const trs = [];
        trs.push(`
          <tr id="${miner.name}">
                <td>${miner.name}</td>
                <td>${getStatusBadge(miner.status)}</td>
                <td>
                    <div class="btn-group">
                      ${miner.sum}
                    </div>
                </td>
                <td>
                    ${getActionButton(miner.status)}
                </td>
            </tr>
        `);
  
        $('#tbl-content tbody').html(trs.join(''));
      }

      function showStdLog(process) {
        const $console = $('#console');
        $console.empty();
        // socket.removeAllListeners();
  
        // socket.on(`${process}:out_log`, (procLog) => {
        //   $console.append(`<p id="console-text">${procLog.data}</p>`);
        //   $('#console-background').animate({ scrollTop: $console[0].scrollHeight + 1000 }, 500);
        // });
      }
      $(document).on('click', '#getCsv', function () {
        window.location.href="/crawl";
      });

      $(document).on('click', '#submit', async function () {
        document.getElementById("submit").disabled = true;
        var data = $('form').serializeArray();
        var obj = {
          name: data[0].value,
          status: 'online',
          sum: 0
        }
        updateMinersStatus(obj);
        var dataRs;
        try {
          dataRs = await fetch('/home',  {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
          }).then(response => response.json())
          .then((body) => {
            var sum = body.sum;
            if (sum === 0) {
              $('#exampleModal').modal('show');
              $('#messageModal').text("Not found data with keyword!")
            }
            console.log(body);
            document.getElementById("submit").disabled = false;
            obj = {
              name: data[0].value,
              status: 'stopped',
              sum: sum
            }
            updateMinersStatus(obj);
          });
        } catch (error) {
          document.getElementById("submit").disabled = false;
          obj = {
            name: data[0].value,
            status: 'error',
            sum: 0
          }
          updateMinersStatus(obj);
          $('#exampleModal').modal('show');
          $('#exampleModalLabel').text("Something went wrong.")
          $('#messageModal').text("Sorry, something went wrong there. Try again.")
        }
      });
    });
  }(window.jQuery, window, document));
  