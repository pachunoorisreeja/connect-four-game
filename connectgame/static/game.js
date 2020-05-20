$(document).ready(function(){

        var username = $("#user_name").text();
        var gameid = $("#game_id").text();
        var game_start = 0;

        const p1_color = "rgb(237, 45, 73)";
        const p2_color = "rgb(86, 151, 255)";

        var table=$("table tr");

        function changeColor(rowIndex,colIndex,color){
          return table.eq(rowIndex).find('td').eq(colIndex).find('input').css('background-color',color);
        }

        function checkColor(rowIndex,colIndex){
          return table.eq(rowIndex).find('td').eq(colIndex).find('input').css('background-color');
        }

        function colorcheck(one,two,three,four){
          return (one==two && one==three && one==four && one!='rgb(240, 240, 240)')
        }

        function HorizWinCheck(){
          for(row=0;row<6;row++){
            for(col=0;col<3;col++){
              if(colorcheck(checkColor(row,col),checkColor(row,col+1),checkColor(row,col+2),checkColor(row,col+3))){
                return true;
              }
            }
          }
          return false;
        }

        function VertWinCheck(){
          for(col=0;col<6;col++){
            for(row=0;row<3;row++){
              if(colorcheck(checkColor(row,col),checkColor(row+1,col),checkColor(row+2,col),checkColor(row+3,col))){
                return true;
              }
            }
          }
          return false;
        }

        function DiagWinCheck(){
          for(col=0;col<5;col++){
            for(row=0;row<6;row++){
              if(colorcheck(checkColor(row,col),checkColor(row+1,col+1),checkColor(row+2,col+2),checkColor(row+3,col+3))){
                return true;
              }else if(colorcheck(checkColor(row,col),checkColor(row-1,col+1),checkColor(row-2,col+2),checkColor(row-3,col+3))){
                return true;
              }
            }
          }
          return false;
        }

        const socket = new WebSocket('ws://'+ window.location.host+ '/ws/game/'+ gameid+ '/');

        socket.onopen = function(e){
          console.log("Welcome message from server..!! ");
          socket.send(JSON.stringify({"type":"connect_game","player_name":username}));
        };

        socket.onclose = function(e) {
            console.error('Socket closed unexpectedly');
            window.location.pathname = '/';
        };

        socket.onmessage = function(e) {
            const data = JSON.parse(e.data);

            if(data.type=="game_message"){
                  if(username==data.username){
                    color = p1_color;
                  }else{
                    color = p2_color;
                  }
                  if(checkColor(data.row,data.col)=="rgb(240, 240, 240)"){
                     changeColor(data.row,data.col,color);
                  }
                  if(VertWinCheck()||HorizWinCheck()||DiagWinCheck()){
                    if(username==data.username){alert("Congratulations "+username+" , you have won the game...!! ");}
                    else{alert("Hmmm, "+username+" you lost the game. Better luck next time...");}
                    $("input[type='button']").css('background-color','rgb(240, 240, 240)');

                  }
                  if($("#mymove").text()=="1"){
                    $("#mymove").text(0);
                    $("#turn_name").text("Opponent's turn");
                    $("#turn_name").css({'color':p2_color});
                  }else{
                    $("#mymove").text(1);
                    $("#turn_name").text("Your turn");
                    $("#turn_name").css({'color':p1_color});
                  }

            }else if(data.type=="connect_game"){
                  if(data.player_name==username){
                    if(data.pl_msg.startsWith("You")){
                        $("#player_no").text(data.playerid);
                        $("#mymove").text(1);
                        $("#turn_name").text("Your turn");
                        $("#turn_name").css({'color':p1_color});
                        if(data.playerid==2){
                          $("#mymove").text(0);
                          $("#turn_name").text("Opponent's turn");
                          $("#turn_name").css({'color':p2_color});
                        }
                      }else{
                        window.location.pathname = '/';
                      }
                  }
            }
            else{
              console.error("Some error occured, please try again ...");
            }
        };


        $("input[type='button']").click(function(){
          var mymove = $("#mymove").text();
          if(mymove=="1"){
            var table=$("table tr");
            var col_object = $(this).closest('td');

            var row = $(col_object).closest('tr').index();
            var col = col_object.index();
            if(checkColor(row,col)=="rgb(240, 240, 240)"){
              socket.send(JSON.stringify({"type":"game_message","username":username,"row":row,"col":col}));
            }
          }
        });




});
