from django.urls import path,include
from connectgame import views

urlpatterns = [
    path('',views.index,name='index'),
    path('game/',views.game,name='game'),
]
