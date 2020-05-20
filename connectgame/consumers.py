
# ASYNCHRONOUS COMMUNICATION
import json
from channels.generic.websocket import AsyncWebsocketConsumer

def create_room(room_name,player_name):
    try:
        with open('rooms.json') as jsonfile:
            room_data = json.load(jsonfile)
            if room_name in room_data.keys():
                if len(room_data[room_name].keys())>1:
                    return {'player_number':None,'Message':'ERROR: Room Occupied'}
                if room_data[room_name]["Player1"] == player_name:
                    return {'player_number':None,'Message':'ERROR: Both players have same names. Try some other name.'}

                room_data[room_name]["Player2"] = player_name
                player_number = 2
            else:
                room_data[room_name] = {"Player1":player_name}
                player_number = 1
    except:
        room_data = {}
        room_data[room_name] = {"Player1":player_name}
        player_number = 1

    with open('rooms.json','w') as outfile:
        json.dump(room_data,outfile)

    return {'player_number':player_number,'Message':'You are assigned as Player'+str(player_number)}

def delete_room(room_name):
    try:
        with open('rooms.json') as jsonfile:
            room_data = json.load(jsonfile)
            if room_name in room_data.keys():
                del room_data[room_name]
    except:
        pass

    with open('rooms.json','w') as outfile:
        json.dump(room_data,outfile)



class PlayerConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.gameid = self.scope['url_route']['kwargs']['gameid']
        self.room_name = 'game_%s' % self.gameid
        print("Connection Opened Successfully --- (",self.room_name,")")
         # Add room in channel
        await self.channel_layer.group_add(self.room_name,self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        # Leave room
        print("Connection Closed --- (",self.room_name,")")
        await self.channel_layer.group_discard(self.room_name,self.channel_name)

        delete_room(self.room_name)


    async def receive(self, text_data):
        json_text_data= json.loads(text_data)
        type = json_text_data["type"]
        if type=="game_message":
            print("I am in Game Mode ")
            username = json_text_data['username']
            row = json_text_data['row']
            col = json_text_data['col']

            print("Received Messsage -- ( ",username," : ROW - ",row," , COL - ",col," )")
            # Send message to room group
            await self.channel_layer.group_send(self.room_name,{'type': 'game_message',
                                                                'username': username,
                                                                'row': row,
                                                                'col':col})

        elif type=="connect_game":
            print("I am in connect_game ")
            player_name = json_text_data['player_name']
            x = create_room(self.room_name,player_name)

            if x['player_number']:
                self.player_name = player_name
                self.playerid = x['player_number']
                print(player_name,"-->> ID : ",self.playerid)

                await self.channel_layer.group_send(self.room_name,{'type': 'connect_game',
                                                                    'playerid': self.playerid,
                                                                    'pl_msg':x['Message'],
                                                                    'player_name': self.player_name
                                                                    })
            else:
                await self.channel_layer.group_send(self.room_name,{'type': 'connect_game',
                                                                    'pl_msg':x['Message'],
                                                                    'player_name': self.player_name
                                                                    })



   # Receive message from room group
    async def connect_game(self, event):
        playerid = event['playerid']
        player_name = event['player_name']
        pl_msg = event['pl_msg']
        # Send message to WebSocket
        await self.send(text_data=json.dumps({'type': 'connect_game','playerid': playerid,'player_name': player_name,'pl_msg': pl_msg}))


    # Receive message from room group
    async def game_message(self, event):
        username = event['username']
        row = event['row']
        col = event['col']

        # Send message to WebSocket
        await self.send(text_data=json.dumps({'type': 'game_message','username': username,'row': row,'col':col}))
