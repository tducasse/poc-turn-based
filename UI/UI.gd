extends VBoxContainer


var ressource = 10 setget set_ressource
var income = 0 setget set_income

onready var ressourceLabel := $MarginContainer/TopLine/RessourceLabel
onready var incomeLabel := $MarginContainer/TopLine/IncomeLabel
onready var prepTimerLabel := $MarginContainer/TopLine/PrepTimerLabel
onready var prepTimer := $MarginContainer/TopLine/PrepTimerLabel/PrepTimer

signal leave_room()

# Called when the node enters the scene tree for the first time.
func _ready():
	update_labels()


func _process(_delta):
	update_prep_label()


func on_ressource_spent(cost: int, incomeValue: int):
	if (cost <= ressource) :
		self.ressource -= cost
		self.income += incomeValue
	else :
		print('MIPMOP')


func earn_income():
	self.ressource += self.income


func set_ressource(value: int):
	ressource = value
	update_labels()


func set_income(value: int):
	income = value
	update_labels()



func update_labels():
	ressourceLabel.bbcode_text = "[center]Ressource : %d[/center]" % ressource
	incomeLabel.bbcode_text = "[center]Income : %d[/center]" % income
	update_prep_label()


func update_prep_label():
	prepTimerLabel.bbcode_text = "[center]%d[/center]" % prepTimer.time_left


func start_prepTimer():
	prepTimer.start()


func _on_PrepTimer_timeout():
	earn_income()
	prepTimer.start()


func _on_Button_pressed():
	emit_signal("leave_room")
