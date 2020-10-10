extends NeedsServer


onready var messages := $Messages
onready var input := $Input
onready var nickname_node = $VBoxContainer/Nickname

func _ready():
	_connection = WS.connect(WS.TYPES.NEW_CHAT_MESSAGE, self, "_add_message")
	_connection = WS.connect(WS.TYPES.SET_NICKNAME, self, "_update_nickname")


func _add_message(value):
	var message = value.message
	var nickname = value.get("nickname", "no name")
	messages.text += str(nickname) + ": " + message + '\n'
	messages.scroll_vertical = INF
	

func _on_Input_text_entered(new_text):
	WS.send_message(WS.TYPES.NEW_CHAT_MESSAGE, new_text)
	input.text = ''


func _on_Nickname_text_entered(new_text):
	WS.set_nickname(new_text)


func _update_nickname(value):
	nickname_node.text = str(value)
