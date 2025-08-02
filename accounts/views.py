from django.shortcuts import render

def login_view(request):
    return render(request, 'accounts/login.html')


def signup_view(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('accounts:login')  # You'll add this next
    else:
        form = UserCreationForm()
    return render(request, 'accounts/signup.html', {'form': form})