let isDragging = false;
let draggedCardSrc = null;
let draggedCardElement = null;
let dragAndDropEnabled = true;
let draggedCardElementData = null;

const boardCanvas = document.getElementById('boardCanvas');
const ctx = boardCanvas.getContext('2d');

board = {

};


let allowedCoords = [
   [0, 1],
   [1, 0],
   [-1, 0],
   [0, -1]
];
let globalMinX = 0;
let globalMaxY = 0;
let finishCards = [
   [8, 2],
   [8, 0],
   [8, -2]
]
let staticCards = [
   [0, 0], ...finishCards
]
let step = 3;

const cardImagesCache = {}; // Кэш для изображений

document.querySelectorAll('.card').forEach(card => {


   card.addEventListener('dragstart', function (e) {
      draggedCardSrc = card.getAttribute('src');
      draggedCardElement = card;
      draggedCardElementData = {
         card_data: card.getAttribute("data-card_data"),
         id: card.getAttribute('id'),
         is_rotated: card.getAttribute('data-is_rotated'),
         type: card.getAttribute('data-type')
      };

      e.dataTransfer.setData("text/plain", card_data);
      isDragging = true;


   });

   card.addEventListener('dragend', function () {
      isDragging = false;
      drawBoard();
   });
});


function drawBoard() {
   const coords = Object.keys(board).map(key => key.split(',').map(Number));
   const xs = coords.map(c => c[0]);
   const ys = coords.map(c => c[1]);
   const minX = Math.min(...xs, ...allowedCoords.map(c => c[0])) - step;
   const maxX = Math.max(...xs, ...allowedCoords.map(c => c[0])) + step;
   const minY = Math.min(...ys, ...allowedCoords.map(c => c[1])) - step;
   const maxY = Math.max(...ys, ...allowedCoords.map(c => c[1])) + step;

   globalMinX = minX;
   globalMaxY = maxY;

   const cellSize = 60;
   boardCanvas.width = (maxX - minX + 1) * cellSize;
   boardCanvas.height = (maxY - minY + 1) * cellSize;

   ctx.clearRect(0, 0, boardCanvas.width, boardCanvas.height);

   for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
         const key = `${x},${y}`;
         const px = (x - minX) * cellSize;
         const py = (maxY - y) * cellSize;

         ctx.fillStyle = board[key] ? "#ccc" : "#ffffff33";
         ctx.strokeStyle = "black";
         ctx.fillRect(px, py, cellSize, cellSize);
         ctx.strokeRect(px, py, cellSize, cellSize);

         ctx.fillStyle = "black";
         ctx.font = "10px Arial";
         ctx.fillText(key, px + 5, py + 12);

         if (board[key]) {
            let imgSrc = JSON.parse(board[key].card_data, true)["img"];

            let is_rotated = board[key].is_rotated;


            const card_type = JSON.parse(board[key].card_data, true)["type"];


            imgSrc = './img/' + card_type + '/' + imgSrc;

            if (!cardImagesCache[imgSrc]) {
               const img = new Image();
               img.src = imgSrc;
               img.onload = () => {
                  cardImagesCache[imgSrc] = img;
                  //

                  if (is_rotated) {
                     ctx.save(); // сохранить текущее состояние

                     // переносим систему координат в центр изображения
                     ctx.translate(px + cellSize / 2, py + cellSize / 2);

                     // поворот на 180 градусов (π радиан)
                     ctx.rotate(Math.PI);

                     // рисуем изображение, центрируя его вокруг (0,0)
                     ctx.drawImage(
                        img,
                        -cellSize / 2 + 5,
                        -cellSize / 2 + 5,
                        cellSize - 10,
                        cellSize - 10
                     );

                     ctx.restore(); // вернуть состояние
                  } else {
                     ctx.drawImage(img, px + 5, py + 5, cellSize - 10, cellSize - 10);
                  }


               };
            } else {


               if (is_rotated) {
                  ctx.save(); // сохранить текущее состояние

                  // переносим систему координат в центр изображения
                  ctx.translate(px + cellSize / 2, py + cellSize / 2);

                  // поворот на 180 градусов (π радиан)
                  ctx.rotate(Math.PI);

                  // рисуем изображение, центрируя его вокруг (0,0)
                  ctx.drawImage(
                     cardImagesCache[imgSrc],
                     -cellSize / 2 + 5,
                     -cellSize / 2 + 5,
                     cellSize - 10,
                     cellSize - 10
                  );

                  ctx.restore(); // вернуть состояние
               } else {
                  ctx.drawImage(cardImagesCache[imgSrc], px + 5, py + 5, cellSize - 10, cellSize - 10);
               }

            }
         }
      }
   }

   if (isDragging) {

      if (draggedCardElementData["type"] === "action") {
         card_data = JSON.parse(draggedCardElementData["card_data"], true)
         if (card_data.action === "see_map") {

            for (const [x, y] of finishCards) {

               const px = (x - minX) * cellSize;
               const py = (maxY - y) * cellSize;
               ctx.strokeStyle = "blue";
               ctx.lineWidth = 2;
               ctx.strokeRect(px + 2, py + 2, cellSize - 4, cellSize - 4);
            }

         } else if (card_data.action === "rockfall") {
            for (const key of Object.keys(board)) {
               const [x, y] = key.split(',').map(Number);
               if (!staticCards.some(([ax, ay]) => ax === x && ay === y)) {
                  const px = (x - minX) * cellSize;
                  const py = (maxY - y) * cellSize;
                  ctx.strokeStyle = "blue";
                  ctx.lineWidth = 2;
                  ctx.strokeRect(px + 2, py + 2, cellSize - 4, cellSize - 4);
               }


            }
         }
      } else {
         for (const [x, y] of allowedCoords) {


            const px = (x - minX) * cellSize;
            const py = (maxY - y) * cellSize;
            ctx.strokeStyle = "blue";
            ctx.lineWidth = 2;
            ctx.strokeRect(px + 2, py + 2, cellSize - 4, cellSize - 4);
         }
      }


      ctx.lineWidth = 1;
   }
}
const hasCoordinate = (x, y) => {
   return Object.keys(board).some((key) => {
      const [ax, ay] = key.split(',').map(Number);
      return ax === x && ay === y;
   });
};

function highlightCell(x, y) {
   drawBoard();
   const cellSize = 60;
   const px = (x - globalMinX) * cellSize;
   const py = (globalMaxY - y) * cellSize;

   ctx.strokeStyle = "green";
   ctx.lineWidth = 3;
   ctx.strokeRect(px + 2, py + 2, cellSize - 4, cellSize - 4);
   ctx.lineWidth = 1;
}

boardCanvas.addEventListener("dragover", function (e) {
   e.preventDefault();
   const rect = boardCanvas.getBoundingClientRect();
   const cellSize = 60;
   const x = Math.floor((e.clientX - rect.left) / cellSize) + globalMinX;
   const y = globalMaxY - Math.floor((e.clientY - rect.top) / cellSize);

   var card = draggedCardElementData
   if (card["type"] === "action") {

      card_data = JSON.parse(draggedCardElementData["card_data"], true)
      if (card_data.action === "see_map") {
         if (finishCards.some(([ax, ay]) => ax === x && ay === y)) {
            highlightCell(x, y);
         } else {
            drawBoard();
         }
      } else if (card_data.action === "rockfall") {
         if (hasCoordinate(x, y) && !staticCards.some(([ax, ay]) => ax === x && ay === y)) {

            highlightCell(x, y);
         } else {
            drawBoard();
         }
      }

   } else {
      if (allowedCoords.some(([ax, ay]) => ax === x && ay === y)) {
         highlightCell(x, y);
      } else {
         drawBoard();
      }
   }


});

function disableDragAndDrop() {
   dragAndDropEnabled = false;
   isDragging = false;
   draggedCardSrc = null;
   draggedCardElement = null;
   draggedCardElementData = null;

}

function enableDragAndDrop() {
   dragAndDropEnabled = true;
}

boardCanvas.addEventListener("drop", function (e) {
   if (!dragAndDropEnabled) {
      toastr.info("Please wait!")
      return false;

   }
   e.preventDefault();
   const rect = boardCanvas.getBoundingClientRect();
   const cellSize = 60;
   const x = Math.floor((e.clientX - rect.left) / cellSize) + globalMinX;
   const y = globalMaxY - Math.floor((e.clientY - rect.top) / cellSize);

   const key = `${x},${y}`;
   var card = draggedCardElementData

   if (card["type"] === "action") {

      card_data = JSON.parse(draggedCardElementData["card_data"], true)
      if (card_data.action === "see_map") {

         if (finishCards.some(([ax, ay]) => ax === x && ay === y)) {

            if (draggedCardElementData) {
               if (draggedCardElement && draggedCardElement.parentNode) {

                  turn(draggedCardElement.dataset.id, `${document.getElementById('id').innerText}`, [x, y])

                  disableDragAndDrop()
               }


               draggedCardSrc = null;
               draggedCardElement = null;
               isDragging = false;
               draggedCardElementData = null;

               drawBoard();
            }
         }

      } else if (card_data.action === "rockfall") {

         if (!staticCards.some(([ax, ay]) => ax === x && ay === y)) {


            if (draggedCardElementData) {
               if (draggedCardElement && draggedCardElement.parentNode) {

                  turn(draggedCardElement.dataset.id, `${document.getElementById('id').innerText}`, [x, y])

                  disableDragAndDrop()
               }


               draggedCardSrc = null;
               draggedCardElement = null;
               isDragging = false;
               draggedCardElementData = null;

               drawBoard();
            }
         }


      }


   } else {

      if (allowedCoords.some(([ax, ay]) => ax === x && ay === y)) {
         if (!board[key] && draggedCardElementData) {
            board[key] = draggedCardElementData;

            // // Удаляем карту из .cards
            if (draggedCardElement && draggedCardElement.parentNode) {


               turn(draggedCardElement.dataset.id, `${document.getElementById('id').innerText}`, [x, y])

               disableDragAndDrop()
            }

            // Сброс

            draggedCardSrc = null;
            draggedCardElement = null;
            isDragging = false;
            draggedCardElementData = null;

            drawBoard();
         }
      }

   }

});


let socket;

function connect() {
   const lobbyId = document.getElementById('lobbyId').value;
   const wsUrl = `ws://127.0.0.1:8000/ws/lobby/${lobbyId}/`;
   socket = new WebSocket(wsUrl);


   socket.onopen = function () {
      document.getElementById('status').innerText = 'Connected to lobby ' + lobbyId;
   };

   socket.onmessage = function (event) {
      const data = JSON.parse(event.data);
      const chat = document.getElementById('chat');
      const sys = document.getElementById('system');
      const li = document.createElement('li');


      if (data.player !== 'system') {
         li.textContent = `${data.message}`;
         if (data.player == document.getElementById('id').innerText) {
            li.className = 'go_right';
         }
         chat.appendChild(li);
      }

      if (data.status === "full") {
         $(".lobby_form").show();
         $(".status_box").hide();
         $(".waiting_form").hide();
         $(".right_box").hide()
         toastr.error(data.message);
      } else {
         $(".lobby_form").hide();
         $(".status_box").show();
         $(".waiting_form").show();
         $(".right_box").show()


      }

      switch (data.status) {
         case "play":
            if (data.message === document.getElementById('id').innerText) { //localStorage.getItem("id")
               enableDragAndDrop()

               $("#turn-timer-box").show()
               $(".player").removeClass("player_turn")
            } else {
               disableDragAndDrop()
               $(".player").removeClass("player_turn")
               $(".player[data-id='" + data.message + "']").addClass("player_turn")
               $("#turn-timer-box").hide()
            }

            break;
         case "full_lobby":
            document.getElementById('start').style.display = 'block';
            toastr.info("Please press ready button!");
            break;
         case "waiting":
            document.getElementById('start').style.display = 'none';
            toastr.success(data.message);
            disableDragAndDrop()
            break;
         case "id":
            document.getElementById('id').innerText = data.message;
            localStorage.setItem("id", data.message)
            break;
         case "player_cards":

            const cards_box = document.getElementById("cards");
            cards_box.innerHTML = "";

            for (let i = data.message.length - 1; i >= 0; i--) {
               const imgSrc = JSON.parse(data.message[i].card_data)["img"];
               const card_type = JSON.parse(data.message[i].card_data)["type"];
               if (card_type === "player") {
                  $(".player_card img").attr("src", `./img/${card_type}/${imgSrc}`);
                  $(".player_type").text(JSON.parse(data.message[i].card_data)["player"])
                  $(".create_logo").hide()
                  $(".status_box").addClass("move_left")
                  continue
               }

               const imgEl = document.createElement('img');
               imgEl.src = `./img/${card_type}/${imgSrc}`;
               imgEl.className = 'card';
               imgEl.draggable = true;
               imgEl.dataset.card_data = data.message[i].card_data;
               imgEl.dataset.type = data.message[i].type;
               imgEl.dataset.id = data.message[i].id;
               imgEl.style.width = "60px";
               imgEl.id = data.message[i].id
               imgEl.is_rotated = data.message[i].is_rotated

               if (data.message[i].is_rotated) {
                  imgEl.classList.add("rotated");
               }

               imgEl.addEventListener('dragstart', function (e) {
                  draggedCardSrc = imgEl.getAttribute('src');
                  draggedCardElement = imgEl;
                  e.dataTransfer.setData("text/plain", "card_data");
                  draggedCardElementData = {
                     card_data: imgEl.getAttribute("data-card_data"),
                     id: imgEl.getAttribute('id'),
                     is_rotated: imgEl.getAttribute('data-is_rotated'),
                     type: imgEl.getAttribute('data-type')
                  };
                  isDragging = true;
               });

               imgEl.addEventListener('dragend', function () {
                  isDragging = false;
                  drawBoard();
               });
               imgEl.addEventListener('click', () => rotation(data.message[i]))

               cards_box.appendChild(imgEl);
            }
            break;
         case "board":
            board = data.message
            drawBoard();
            break
         case "allowedCoords":
            allowedCoords = data.message
            drawBoard()
            break
         case "error_turn":

            board = data.message
            enableDragAndDrop()
            drawBoard();
            break
         case "error":

            if (!data.message.lantern || !data.message.pickaxe || !data.message.cart) {
               toastr.error("You are blocked by action cards! Please use your action cards to fix or skip your turn!")
            } else {
               toastr.error("Wrong path please use other card!")
            }

            break;
         case "winner":
            toastr.success("Winner" + data.message);

            break
         case "gold_cards":

            html = ``

            for (var i = data.message.length - 1; i >= 0; i--) {
               html += `<img onclick="gold('${data.message[i].golds}')" src="./img/gold/${data.message[i].img}" alt="">`
            }

            Swal.fire({
               title: "<strong>Pick Gold!</strong>",
               html: `<div class="golds_pick_box">${html}</div>`,
               showCloseButton: false,
               showCancelButton: false,
               focusConfirm: false,
               width: 700,
               backdrop: `
								    rgba(0,0,123,0.4)
								    url("./img/game/nyan-cat.gif")
								    left top
								    no-repeat
								  `

            });
            break
         case "see_card":


            const imgSrc = JSON.parse(data.message.card_data)["img"];
            const card_type = JSON.parse(data.message.card_data)["type"];
            Swal.fire({
               imageUrl: `./img/${card_type}/${imgSrc}`,
               imageHeight: 200,
               imageAlt: "A tall image"
            });
            break
         case "players":
            const players_box = document.getElementById("players");
            players_box.innerHTML = "";
            for (let i = data.message.length - 1; i >= 0; i--) {

               const player = document.createElement('div');
               player.className = 'player player-slot';
               player.dataset.id = data.message[i].id;
               player.dataset.pickaxe = data.message[i].pickaxe;
               player.dataset.lantern = data.message[i].lantern;
               player.dataset.cart = data.message[i].cart;
               //player.innerText = data.message[i].id;
               htmls =
                  `<img src="./img/game/player` + (i + 1) + `.png" alt="Player 1" class="player-fill">
			                        <div class="damage-icon" data-tool="pickaxe"></div>
			                        <div class="damage-icon" data-tool="cart"></div>
			                        <div class="damage-icon" data-tool="lantern"></div>`

               if (!data.message[i].pickaxe) {
                  htmls += `<div class="damage-icon tools_block" data-tool="pickaxe" style="display: none;">❌</div>`

               }
               if (!data.message[i].lantern) {
                  htmls += `<div class="damage-icon tools_block" data-tool="lantern" style="display: none;">❌</div>`

               }
               if (!data.message[i].cart) {
                  htmls += `<div class="damage-icon tools_block" data-tool="cart" style="display: none;">❌</div>`

               }
               $(player).html(htmls)


               player.addEventListener("drop", function (e) {
                  e.preventDefault();


                  var card = draggedCardElementData

                  if (card["type"] === "action") {

                     card_data = JSON.parse(draggedCardElementData["card_data"], true)
                     if (card_data.action !== "see_map" && card_data.action !== "rockfall") {

                        Array.from(document.getElementsByClassName("player")).forEach(function (element) {
                           element.style.border = "1px solid black";
                        });


                        if (card_data.action === 'dual_pickaxe_lantern' || card_data.action === 'dual_pickaxe_cart' || card_data.action === 'dual_lantern_cart') {

                           let act = ""

                           const swalWithBootstrapButtons = Swal.mixin({
                              customClass: {
                                 confirmButton: "btn btn-success",
                                 cancelButton: "btn btn-danger"
                              },
                              buttonsStyling: false
                           });
                           swalWithBootstrapButtons.fire({
                              title: "Which action?",
                              text: "Please choose one action!",
                              icon: "warning",
                              showCancelButton: true,
                              confirmButtonText: "Fix " + card_data.action.split("_")[1],
                              cancelButtonText: "Fix " + card_data.action.split("_")[2],
                              reverseButtons: true
                           }).then((result) => {
                              if (result.isConfirmed) {
                                 act = card_data.action.split("_")[1]
                              } else if (
                                 result.dismiss === Swal.DismissReason.cancel
                              ) {
                                 act = card_data.action.split("_")[2]
                              }


                              if (draggedCardElementData) {
                                 if (draggedCardElement && draggedCardElement.parentNode) {

                                    turn(draggedCardElement.dataset.id, `${document.getElementById('id').innerText}`, [player.dataset.id, act])

                                    disableDragAndDrop()
                                 }


                                 draggedCardSrc = null;
                                 draggedCardElement = null;
                                 isDragging = false;
                                 draggedCardElementData = null;

                              }


                           });
                        } else {

                           if (draggedCardElementData) {
                              if (draggedCardElement && draggedCardElement.parentNode) {

                                 turn(draggedCardElement.dataset.id, `${document.getElementById('id').innerText}`, [player.dataset.id, player.dataset.id])

                                 disableDragAndDrop()
                              }


                              draggedCardSrc = null;
                              draggedCardElement = null;
                              isDragging = false;
                              draggedCardElementData = null;

                           }

                        }


                     }
                  }


               })

               player.addEventListener("dragover", function (e) {
                  e.preventDefault();

                  var card = draggedCardElementData

                  if (card["type"] === "action") {

                     card_data = JSON.parse(draggedCardElementData["card_data"], true)
                     if (card_data.action !== "see_map" && card_data.action !== "rockfall") {

                        Array.from(document.getElementsByClassName("player")).forEach(function (element) {
                           element.style.border = "1px solid blue";
                        });
                     }
                  }


               })


               players_box.appendChild(player);
               $(".players").show()

            }
            break

         case "update_player":

            console.log(data.message.id, document.getElementById('id').innerText)
            if (data.message.id !== document.getElementById('id').innerText) {

               console.log("ddddd")

               _this = $(".player[data-id='" + data.message.id + "']");

               _this.find(".tools_block").remove()
               htmls = ``
               if (!data.message.pickaxe) {
                  htmls += `<div class="damage-icon tools_block" data-tool="pickaxe" >❌</div>`


               }
               if (!data.message.lantern) {
                  htmls += `<div class="damage-icon tools_block" data-tool="lantern">❌</div>`

               }
               if (!data.message.cart) {
                  htmls += `<div class="damage-icon tools_block" data-tool="cart">❌</div>`

               }
               _this.html(_this.html() + htmls)

            } else {

               $(".mytools").removeClass("show_my_tool_error");
               if (!data.message.pickaxe) {
                  $(".mytools[data-id='pickaxe']").addClass("show_my_tool_error");


               }
               if (!data.message.lantern) {
                  $(".mytools[data-id='lantern']").addClass("show_my_tool_error");

               }
               if (!data.message.cart) {
                  $(".mytools[data-id='cart']").addClass("show_my_tool_error");

               }

            }


            break

         case "join":

            d = data.message;
            html = ""
            for (let i = d.length - 1; i >= 0; i--) {

               html += '<div class="user_lobby_item"><div class="avatar"><img src="./img/game/player.png" alt=""></div> <div class="name">Player ' + (i + 1) + '</div></div>'
            }

            $(".waiting_form").html(html)

            break;
         case "start_game":
            toastr.success(data.message);
            $(".lobby_main").hide();
            $(".player_card").show()
            $(".board").show()
            $(".main-bg").addClass("bg")
            $(".my_avatar").css("display", "flex")
            break;

         case "sys":
            toastr.info(data.message);
            break
         case "labby_player_ready":

            toastr.info(data.message);
            break

         case "game_over":
            html = ``

            for (var i = data.message.length - 1; i >= 0; i--) {
               html += `<div class="user_lobby_item" style="width: unset"><div class="avatar"><img src="./img/game/player.png" alt=""></div> <div class="text  fz16">${ data.message[i].id}</div></div>`
            }

            Swal.fire({
               title: "<strong>Game Over!</strong>",
               html: `<div class="">${html}</div>`,
               showCloseButton: false,
               showCancelButton: false,
               focusConfirm: false,
               width: 700,
               backdrop: `
								    rgba(0,0,123,0.4)
								    url("./img/game/nyan-cat.gif")
								    left top
								    no-repeat
								  `

            });
            break;


      }
   };

   socket.onclose = function () {
      document.getElementById('status').innerText = 'Disconnected';
   };

   socket.onerror = function (error) {
      console.error("WebSocket error:", error);
   };
}

function rotation(card) {

   if (card.type === "path") {
      if (socket && socket.readyState === WebSocket.OPEN) {
         data = {
            player: document.getElementById('id').innerText,
            card: card
         }
         socket.send(JSON.stringify({
            message: JSON.stringify(data),
            action: 'rotation'
         }));
         r_img = document.getElementById(card.id)
         r_img.classList.toggle("rotated")

      }
   }


}

function sendMessage() {
   const input = document.getElementById('messageInput');
   const message = input.value;
   if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
         message
      }));
      input.value = '';
   }
}

function start() {
   if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
         message: 'Ready'
      }));
   }
}

function turn(card, player, turn) {
   if (socket && socket.readyState === WebSocket.OPEN) {
      data = {
         turn: turn,
         player: player,
         card: card
      }
      socket.send(JSON.stringify({
         message: JSON.stringify(data),
         action: 'turn'
      }));
   }
}


function gold(id) {


   if (socket && socket.readyState === WebSocket.OPEN) {
      data = {
         player: document.getElementById('id').innerText,
         gold: id
      }
      socket.send(JSON.stringify({
         message: JSON.stringify(data),
         action: 'gold'
      }));
      $(".swal2-confirm").click()
   }
}

let trash = document.getElementById('trash');
trash.addEventListener("drop", function (e) {
   e.preventDefault();


   var card = draggedCardElementData


   card_data = JSON.parse(draggedCardElementData["card_data"], true)


   Array.from(document.getElementsByClassName("trash")).forEach(function (element) {
      element.style.border = "1px solid black";
   });

   if (draggedCardElementData) {
      if (draggedCardElement && draggedCardElement.parentNode) {

         if (socket && socket.readyState === WebSocket.OPEN) {
            data = {

               player: document.getElementById('id').innerText,
               card: draggedCardElement.dataset.id,
               type: "trash"
            }
            socket.send(JSON.stringify({
               message: JSON.stringify(data),
               action: 'turn'
            }));
         }

         disableDragAndDrop()
      }


      draggedCardSrc = null;
      draggedCardElement = null;
      isDragging = false;
      draggedCardElementData = null;


   }


})

trash.addEventListener("dragover", function (e) {
   e.preventDefault();

   var card = draggedCardElementData


   card_data = JSON.parse(draggedCardElementData["card_data"], true)

   Array.from(document.getElementsByClassName("trash")).forEach(function (element) {
      element.style.border = "1px solid blue";
   });


})

let my_avatar = document.getElementById('my_avatar');
my_avatar.addEventListener("drop", function (e) {
   e.preventDefault();


   var card = draggedCardElementData

   if (card["type"] === "action") {

      card_data = JSON.parse(draggedCardElementData["card_data"], true)
      if (card_data.action !== "see_map" && card_data.action !== "rockfall") {

         Array.from(document.getElementsByClassName("my_avatar")).forEach(function (element) {
            element.style.border = "1px solid black";
         });

         if (card_data.action === 'dual_pickaxe_lantern' || card_data.action === 'dual_pickaxe_cart' || card_data.action === 'dual_lantern_cart') {

            let act = ""

            const swalWithBootstrapButtons = Swal.mixin({
               customClass: {
                  confirmButton: "btn btn-success",
                  cancelButton: "btn btn-danger"
               },
               buttonsStyling: false
            });
            swalWithBootstrapButtons.fire({
               title: "Which action?",
               text: "Please choose one action!",
               icon: "warning",
               showCancelButton: true,
               confirmButtonText: "Fix " + card_data.action.split("_")[1],
               cancelButtonText: "Fix " + card_data.action.split("_")[2],
               reverseButtons: true
            }).then((result) => {
               if (result.isConfirmed) {
                  act = card_data.action.split("_")[1]
               } else if (
                  result.dismiss === Swal.DismissReason.cancel
               ) {
                  act = card_data.action.split("_")[2]
               }


               if (draggedCardElementData) {
                  if (draggedCardElement && draggedCardElement.parentNode) {

                     turn(draggedCardElement.dataset.id, `${document.getElementById('id').innerText}`, [document.getElementById('id').innerText, act])

                     disableDragAndDrop()
                  }


                  draggedCardSrc = null;
                  draggedCardElement = null;
                  isDragging = false;
                  draggedCardElementData = null;

               }


            });
         } else {

            if (draggedCardElementData) {
               if (draggedCardElement && draggedCardElement.parentNode) {

                  turn(draggedCardElement.dataset.id, `${document.getElementById('id').innerText}`, [document.getElementById('id').innerText, document.getElementById('id').innerText])

                  disableDragAndDrop()
               }


               draggedCardSrc = null;
               draggedCardElement = null;
               isDragging = false;
               draggedCardElementData = null;

            }

         }
      }
   }


})

my_avatar.addEventListener("dragover", function (e) {
   e.preventDefault();

   var card = draggedCardElementData

   if (card["type"] === "action") {

      card_data = JSON.parse(draggedCardElementData["card_data"], true)
      if (card_data.action !== "see_map" && card_data.action !== "rockfall") {

         Array.from(document.getElementsByClassName("my_avatar")).forEach(function (element) {
            element.style.border = "1px solid blue";
         });
      }
   }


})
document.querySelectorAll(".custom-select").forEach(function (select) {
   const selected = select.querySelector(".select-selected");
   const items = select.querySelector(".select-items");

   selected.addEventListener("click", function () {
      items.classList.toggle("select-hide");
   });

   items.querySelectorAll("div").forEach(function (item) {
      item.addEventListener("click", function () {
         selected.textContent = this.textContent;
         items.classList.add("select-hide");
      });
   });

   // Закрытие при клике вне селекта
   document.addEventListener("click", function (e) {
      if (!select.contains(e.target)) {
         items.classList.add("select-hide");
      }
   });
});




let countdown;
let isPaused = false;
let timeLeft = 0;
let totalTime = 60;
const timer = document.querySelector('.timer');

function updateDisplay() {
    $(".time").text(`${timeLeft} ${timeLeft !== 1 ? '' : ''}`);
}

function startTimer(time) {
    
	timeLeft = time
    clearInterval(countdown);
    countdown = setInterval(() => {
        if (timeLeft <= 0) {
            clearInterval(countdown);
           
            $(".time").text("0");
        } else {
            timeLeft--;


			 const progressDeg = (timeLeft / totalTime) * 360;
			  timer.style.setProperty('--progress', progressDeg.toFixed(1));

			  if (timeLeft > totalTime * 0.5) {
			    timer.style.setProperty('--fill-color', 'limegreen'); 
			  } else if (timeLeft > totalTime * 0.25) {
			    timer.style.setProperty('--fill-color', 'gold'); 
			  } else {
			    timer.style.setProperty('--fill-color', 'red'); 
			  }
			        
            updateDisplay();
        }
    }, 1000);
}



function resetTimer() {
    clearInterval(countdown);
    timeLeft = 0;
    isPaused = false;
  
    updateDisplay();
}

