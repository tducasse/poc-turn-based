extends AcceptDialog

func _ready():
	var label = get_label()
	var ok = get_ok()
	var font = load("res://Fonts/Assurant-Standard.tres")
	label.add_font_override('font', font)
	ok.add_font_override('font', font)

