extends NeedsServer


onready var list = $ItemList
onready var input := $GameName

func _ready():
	_connection = WS.connect("list_rooms", self, "_add_rooms")
	_connection = WS.connect("create_room", self, "_add_one_room")
	_connection = WS.connect("remove_room", self, "_remove_room")
	

func _add_one_room(room):
	list.add_item(room)
	

func _add_rooms(rooms):
	list.clear()
	for room in rooms:
		_add_one_room(room)


func is_same_room(current, room):
	var regex = RegEx.new()
	regex.compile(room  + "( - \\d+)*")
	var result = regex.search(current)
	return result


func _remove_room(room):
	for i in range(list.get_item_count()):
		var current = list.get_item_text(i)
		if is_same_room(current, room):
			list.remove_item(i)
			break


func _on_GameName_text_entered(new_text):
	var name = input.text
	if not name:
		return
	if "-" in name:
		return
	WS.send_message(WS.TYPES.CREATE_ROOM, new_text)
	input.text = ''


func _on_GameName_text_changed(new_text):
	if "-" in new_text:
		input.text = new_text.replace('-','_')
		input.caret_position = input.text.length()
