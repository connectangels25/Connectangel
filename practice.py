# #Swap two numbers
# a = input("enter the first number:")
# b = input("enter the second number:")
# a,b = b,a
# print("after swapping the first number is:",a)
# print("after swapping the second number is:",b)

# #Take marks and calculate percentage
# marks = int(input("enter the marks:"))
# total_marks = int(input("enter the total marks:"))
# percentage_calculation = (marks/total_marks)*100
# print("The percentage is:", percentage_calculation)

# #Simple calculator
# a = int(input("enter the first number:"))
# b = int(input("enter the second number:"))

# operator = input("enter your operation: ")
# if operator == "+":
#     print("the sum is:",a+b)
# elif operator == "-":
#     print("the sub is:",a-b)
# elif operator == "*":
#     print("the multiply is:",a*b)
# elif operator == "/":
#     if b != 0:
#         print("the division is:",a/b)
#     else:
#         print("can't divide")
# else:
#     print("exit")

# #Convert temperature Celsius → Fahrenheit
# celsius = float(input("enter the number: "))
# Fahrenheit = (9/5*celsius) + 32
# print("Temperature Celsius → Fahrenheit:",Fahrenheit)

# #Find square and cube of a number
# a = int(input("Enter the number: "))
# square = a**2
# cube = a**3
# print(f"The square is{square}The cube is{cube}")

#Take 3 numbers and print largest number.

# firstnum = int(input("Enter the first number: "))
# secondnum = int(input("Enter the second number: "))
# thirdnum = int(input("Enter the third number: "))

# if firstnum > secondnum and firstnum > thirdnum:
#     print("The largest number is:" , firstnum)
# elif secondnum > thirdnum and secondnum > firstnum:
#     print("The largest number is:" , secondnum)
# elif thirdnum > firstnum and thirdnum > secondnum:
#     print("The largest number is:" , thirdnum)
# else:
#     print("all number are equal")

"""
Take a number and check:
Positive
Negative
Zero
"""
# num = int(input("enter the number:"))

# if num >= 0:
#     print("Number is positive")
# elif num <= 0:
#     print("Number is Negative")
# elif num == 0:
#     print("Number is zero")

# Check number is even or odd.
# num = int(input("enter the number:"))
# if num % 2 == 0:
#     print("Number is even")
# elif num % 2 != 0:
#     print("Number is even")
# else:
#     print("exit")

# for i in range(3):

#     for j in range(3):
#         print(i,j)
# for i in range(1,5):

#     for j in range(1,i+1):
#         print(j,end="")
#     print()

# for i in range(1,5):

#     for j in range(1,i+1):
#         print( j, end="")

#     print()

# Print numbers 1 to 50

# for i in range(1,51):
#     print(i)

# Print odd numbers from 1 to 100

# for i in range(1,101):
#     if i % 2 != 0:
#         print(i)


# Reverse multiplication table

# num = int(input("enter the number:"))

# for i in range (10,0,-1):
#     print(i*num)


# num = int(input("enter the number:"))

# factorial = 1

# for i in range(1, num + 1):
#     factorial = factorial * i
#     print(factorial)


# n = int(input("enter the number:"))
# a=0
# b=1

# for i in range(n):
#     print(a,end="")
#     a,b=b,a+b


# num = int(input("enter the number:"))
# factorial = 1
# i = 1

# while i<=num:
#     factorial = factorial*i
#     i+=1
# # print("Factorial is:", factorial)


# a=0
# b=1

# for i in range(1,101):
#     print(a,end=" ")
#     a,b=b,a+b

# num = int(input("enter the number:"))

# temp = num 
# total = 0 

# while num > 0:
#     digit = num % 10
#     total = total + digit**3
#     num = num //10
# if temp == total:
#     print("amstrong")
# else:
#     print("not amstrong")

# num = int(input("enter the number:"))

# if num == num[::-1]:
#     print("palindrome")
# else:
#     print("not plindrome")

# prime number 
# count = 0
# for num in range(1,101):
#     is_prime = True
#     for i in range(2,num):
#         if num % i == 0:
#             is_prime = False
#             break
#     if is_prime:
#         count+=1
# print(count,end=" ")

# for num in range(1,101):
#     is_prime = True
#     for i in range(2,num):
#         if num % i == 0:
#             is_prime = False
#             break
#     if is_prime:
#         count+=1
# print(count,end=" ")
        
        
# name = "shazia"
# reverse = name[:,-1]
# print(reverse)


# sentence = input("enter the sentence: ")
# count = 0
# vowels = "aeiou"
# for i in sentence:
#     if i.lower() in vowels:
#         count+=1
# print(count)


# sentence = input("enter the sentence: ")
# count = 0
# for i in sentence:
#     if i.isupper():
#         count+=1
# print(count)



# sentence = input("enter the sentence: ")
# count = 0
# for i in sentence:
#     if i.islower():
#         count+=1
# print(count)



# sentence = "  I am shazia  "
# next = sentence.strip()
# print(next)

# sentence = input("enter the sentence: ")
# a = sentence.split()
# max_word = 0


# for a in sentence:
#     if len(a) > max_word:
#         max_word = a
# print(max_word)

# sentence = input("enter the sentence: ")
# for i in sentence:
#     print(sentence.count(i),end="")

# Function for Fibonacci

# def Fibonacci():
#     n = int(input("enter the number: "))
#     a = 0
#     b = 1
#     for i in range(n):
#         print(a,end=" ")
#         a,b=b,a+b
    
# Fibonacci()


# Function for palindrome
# def palindrome():
#     n = input()
#     if n== n[::-1]:
#         print("plindrome")
#     else:
#         print("not palindrome")

# palindrome()

# Sum of list using function

# def sum_list(n):
    
#     target = 0
#     for i in n:
#         target+=i

# m = [1,2,3,4]
# print(m.sum)
# sum_list(m)
# Sum only EVEN numbers from list


        
def even(n):
    target = 0
    for i in n:
        if i % 2 == 0:
            target +=i
    print(target)

even(map(int,input().split()))
