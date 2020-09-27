extends Node2D


signal on_unit_pressed(cost, incomeValue)


# Called when the node enters the scene tree for the first time.
func _ready():
	pass # Replace with function body.



func _on_Unit1_pressed():
	emit_signal("on_unit_pressed", 1, 1)


func _on_Unit2_pressed():
	emit_signal("on_unit_pressed", 2, 1)


func _on_Unit3_pressed():
	emit_signal("on_unit_pressed", 3, 2)
