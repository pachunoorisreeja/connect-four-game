from django.shortcuts import render

# Create your views here.
def index(req):
    return render(req,'index.html')

def game(request):
    if request.method=="POST":
        username = request.POST.get('username')
        gameid = request.POST.get('gameid')
        return render(request,'game.html',{'username':username,'gameid':gameid})
    else:
        return  render(request,'index.html')
