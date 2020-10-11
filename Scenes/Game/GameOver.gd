extends ConfirmationDialog


func _ready():
	var label = get_label()
	var ok = get_ok()
	var cancel = get_cancel()
	var font = load("res://Fonts/PixelSansSerif.tres")
	label.add_font_override('font', font)
	ok.add_font_override('font', font)
	cancel.add_font_override('font', font)

