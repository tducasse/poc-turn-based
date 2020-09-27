extends VBoxContainer


var ressource = 10 setget set_ressource
var income = 0 setget set_income

onready var ressourceLabel := $MarginContainer/TopLine/RessourceLabel
onready var incomeLabel := $MarginContainer/TopLine/IncomeLabel

# Called when the node enters the scene tree for the first time.
func _ready():
	ressourceLabel.text = "Ressource : %d" % ressource
	incomeLabel.text = "Income : %d" % income


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
	ressourceLabel.text = "Ressource : %d" % ressource


func set_income(value: int):
	income = value
	incomeLabel.text = "Income : %d" % income
