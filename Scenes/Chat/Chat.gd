extends NeedsServer


onready var messages := $Messages
onready var input := $Input

func _ready():
	_connection = WS.connect("new_chat_message", self, "_add_message")


func _add_message(message):
	messages.text +=message + '\n'
	

func _on_Input_text_entered(new_text):
	WS.send_message(WS.TYPES.NEW_CHAT_MESSAGE, new_text)
	input.text = ''
