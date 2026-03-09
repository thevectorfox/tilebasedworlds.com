+++
title = "Crash Course in JavaScript"
date = 2026-03-08T20:00:00+11:00
weight = 0
draft = false
tags = ["beginner", "javascript", "programming"]
next = "/tutorial/01-why-tiles/"
prev = ""
+++

Beginner

So you might be here because you're interested in code or fearful of it. Hopefully, this little read will empower you with some basics. And we'll discover it's really not too scary and kind of exciting what we can do with very little.

These are some foundational concepts. You don't *have* to read or understand this to begin. But if you're unfamiliar with code you might have a better time if you do. I know it's boring and a little hard to relate to these ideas without all the context of what you'll be doing later.

You'll see some words in brackets (hello). These are academic terms next to a layman's term. Whoa, that was quite an academic way of saying the brackets contain a technical term. Don't worry too much about these to begin with. Let these words wash over you. In the future, you may be doing more reading about programming or talking with people that do. Sometimes you'll hear or see them and they are a little daunting but really they're just fancy ways of describing something quite basic.

## Setup

You should be able to play and edit with these examples in the browser you're using.

## Doing something
(Expressions)

Alright let us start with our first program! 

```js
1 + 1
```

If we run this we get the result of `2` now that may seem underwhelming but we've just asked something of the computer and it's given us a result. Have a play and see what happens.

In technical speak, we've combined two values with an operator. This is an expression.

## Doing something with a thing
(variables)

That previous example was a complete program. But not very useful. It's a calculator and we have lots of calculators on phones and computers these days. Programs become more interesting when they don't have fixed values. That's where variables come in. Variables are things that are not fixed, they vary.

```js
const MyValue = 1
1 + MyValue
```

Now I know this still looks like it has fixed values (and you're right they are fixed). But take note that we're assigning `1` to `MyValue`. We do this with a special word `const` and the equals character `=`. The equal character is called an assignment. It assigns the value to the variable name. And the `const` keyword is just a signal that we want to define something. We can use whatever name we like. Let's go a little silly and define lots of them.

```js
const MyValue = 1
const MyOtherValue = 47
const aaaaaaaa = 100
const bananas = 5
const age = 123123123123123

MyValue + MyOtherValue
```

So we can store values to a variable and reuse them later in expressions! This is pretty powerful stuff. It's an organizational tool for us to be able to define things.

## Kinds of things
(Primitive types)

So in these previous examples, we've seen some numbers being used. But there are other things we can use besides numbers. We can assign words as well.

```js
const MyAgeValue = 89
const MyNameValue = "John"
const MyLastValue = "Sue"
const MyAddressValue = "123 Super Nice St, By The Sea"
```

Here if we wrap up a word with quotes and use the `=` character we can assign words! Very useful for dealing with names or addresses. We can send these messages to a user. Words require to be wrapped in quotes (single or double). Because we use words in our program and words in a string we need a way to tell the computer which ones are a part of the program and which ones are a part of the value. 

These are called primitive types or built-in types. So number `10` is a different type to the word `"hello"`.  It's good to be aware of which type you're using because they behave differently. 

```js
const MyNameValue = "John"
const MyLastValue = "Sue"
MyNameValue + MyLastValue
```

You can still use words in expressions but obviously, they don't add up to a number. They have different behaviours than numbers. Using the `+` character you can combine words. But you can't use the `-` character with words.

For some technical jargon, we call words `string` and number `integer`. It helps to know what the underlying type is. When you get further into building something there will be situations where some tools will only work on certain types.

## Grouping things
(Composite types)

So far we've learnt about expressions and types which help us ask the computer to do something. And we've learnt about an organizational tool the `variable`. The next two sections are about more organizational tools. A lot of programming is just trying to keep track of things we ask computers. As humans, we can only think a few things at one time. When the number of things we ask the computer gets bigger, our capacity to think about them melts down. We started struggling to remember what we were asking the computer. (for a more technical summary we would describe this as losing our ability to reason with the program).

So we defined some variables earlier that kind of looked like information about a Person.

```js
const MyAgeValue = 89
const MyNameValue = "John"
```

This is easy enough for us to digest as at the moment. But if the number of things we are trying to keep track of grows it starts to become unmanageable.

```js
const MyAgeValue = 89
const MyNameValue = "John"
const MyLastNameValue = "Sue"
const MyMiddleNameValue = "Lucy"
const MyAddressValue = "123 Super Nice St, By The Sea"
const MyTaxNumberValue = 123456789
const MyDOBValue = "12/12/1950"
const MyStarSignValue = "Leo"
```

Then you may think this isn't too bad. But let's imagine we want all these values for groups of people.

```js
const My1AgeValue = 89
const My1NameValue = "John"
const My1LastNameValue = "Sue"
const My1MiddleNameValue = "Lucy"
const My1AddressValue = "123 Super Nice St, By The Sea"
const My1TaxNumberValue = 123456789
const My1DOBValue = "12/12/1950"
const My1StarSignValue = "Leo"

const My2AgeValue = 51
const My2NameValue = "Yindi"
const My2LastNameValue = "Killara"
const My2MiddleNameValue = "Lowwana"
const My2AddressValue = "321 Awesome St, Somewhere nice"
const My2TaxNumberValue = 987654321
const My2DOBValue = "01/05/1980"
const My2StarSignValue = "Libra"

const My3AgeValue = 35
const My3NameValue = "Freyja"
const My3LastNameValue = "Balder"
const My3MiddleNameValue = "Tyr"
const My3AddressValue = "9 Yggdrasil, In the sky"
const My3TaxNumberValue = 999999999
const My3DOBValue = "29/05/1950"
const My3StarSignValue = "Fehu"
```

As your program grows (and it likely will) so will the demands of the types of information you define. This is where groups of things come in. There are two main ways to group. The first way is the `object`. 

### The Object

An object is describing one thing with many properties (or many variables). An object looks just like any other variable except we wrap the value with curly brackets `{}`. Let's look at an example.

```js
const MyFirstObject = {}
```

That's it... except it's empty and not very useful when it's empty. So let's make it useful by defining things on it. Things on an object are called `properties`. They act like variables in that we get to name them and assign whatever we like to them. So let's define a person as an object.

```js
const Person = {
  name: "John",
  age: 59
}
```

It looks a bit different with those curly brackets. And rather than using the equal character `=` we're using a colon character `:` it might not be obvious right now but we're actually only doing one assignment with the first `Person = {` because these other things are properties of the object they need a different character to make the computer happy. It's a way of declaring many little values as one big value.

Now to get a value from an object it'll look like this.

```js
Person.name
```

We use a dot `.` to access a property.

We can write expressions with objects

```js
Person1.age + Person2.age
```

For reference here are people we define earlier wrapped up in objects. We'll move on for now and take another look at them in the grand finale (you're almost there)

```js
const Person1 = {
	age: 89,
	name: "John",
	lastName: "Sue",
	middleName: "Lucy",
	address: "123 Super Nice St, By The Sea",
	taxNumber: 123456789,
	dob: "12/12/1950",
	starSign: "Leo"
}

const Person2 = {
	age: 51,
	name: "Yindi",
	lastName: "Killara",
	middleName: "Lowwana",
	address: "321 Awesome St, Somewhere nice",
	taxNumber: 987654321,
	dob: "01/05/1980",
	starSign: "Libra"
}

const Person3 = {
	age: 35,
	name: "Freyja",
	lastName: "Balder",
	middleName: "Tyr",
	address: "9 Yggdrasil, In the sky",
	taxNumber: 999999999,
	dob: "29/05/1950",
	starSign: "Fehu"
}
```

Now let's look at the next tool to organise stuff. The Array

### The Array

So arrays are very similar in that they wrap other values. But now instead of using the curly bracket `{}` they use square brackets `[]`. Oh, and they don't have properties... you could say their values are nameless. So let's look at converting one of our people objects into an array

```js
const Person = [
	35,
	"Freyja",
	"Balder",
	"Tyr",
	"9 Yggdrasil, In the sky",
	999999999,
	"29/05/1950",
	"Fehu"
]
```

All these property names are gone, it almost looks neater... rather than using names that we're in control of they use an index. The index isn't controlled by us, the computer handles that. The index acts like letter boxes on a street. They count up as you go along. And they oddly start at zero `0`.

Let's access a property from this Person array. To do this we use the square brackets again along with the index of the thing we want to access. Let's get the first thing in there which is the age, so that's index zero.

```js
Person[0]
```

We could use this in expressions.

```js
Person1[0] + Person2[0]
```

Let's get the first name which is the next one along from the first. So the next one up from zero is one.

```js
Person[1]
```

Although things are a little too neat here. By using an array for this kind of information it becomes really hard to remember which one is the first name or the last name... If we didn't have the previous example, there is no way for me to know which name is which. So although we can use an array here we are probably better off using an object. An object as the name implies is one thing

**Object:**
> a material thing that can be seen and touched

**Array**
> an ordered series or arrangement.

## Reusing stuff
(Functions)

So far we've just done simple things. But if I wanted to say hello to person 1 and person 2... I might write 

```js
"hello " + Person1.name 
"hello " + Person2.name 
```

That's not too bad, but let's say I want to say hello to everyone like Yindi and Freyja.

```js
"hello " + Person1.name 
"hello " + Person2.name 
"hello " + Person3.name 
```

OK yep that works... but now let's say that I wanted to create a complex greeting.

```js
"Greetings wonderful " + Person1.name + " you're " + Person1.age + " years old! What a marvellous " + Person1.starSign + " you must be!"
"Greetings wonderful " + Person2.name + " you're " + Person2.age + " years old! What a marvellous " + Person2.starSign + " you must be!"
"Greetings wonderful " + Person3.name + " you're " + Person3.age + " years old! What a marvellous " + Person3.starSign + " you must be!"
```

That's a lot of repetition. And if I wanted to change the greeting I would need to change it in all three places. And if I added more people I would need to remember to update all the greetings. This is a common problem. When we have to repeat ourselves we get into trouble... We forget things, we type things wrong, and we get tired of it.

Functions are a way to define a chunk of code that can be reused. 

```js
const SayHelloToSomeone = function(person) {
	return "Greetings wonderful " + person.name + " you're " + person.age + " years old! What a marvellous " + person.starSign + " you must be!"
}
```

Ok, this is new, lots of new syntax here. Let me break this down.

We start with a variable like normal `const SayHelloToSomeone =` then we use the keyword `function` wrapping up the parameter variables in brackets `function(person)`. The parameter `person` acts like a variable inside the function. Functions can optionally return a value with the special keyword `return`.

To use our function we would "call" it like this:

```js
SayHelloToSomeone(Person1)
SayHelloToSomeone(Person2)
SayHelloToSomeone(Person3)
```

All the messiness is wrapped up in the function. And if we want to change the greeting, there's only one place to change it. Also if we add more people we can just call the function!

## Grande finale

Write a function to add up the ages of everyone in an array of people.

```js
const People = [
	{
		age: 89,
		name: "John",
		lastName: "Sue",
		middleName: "Lucy",
		address: "123 Super Nice St, By The Sea",
		taxNumber: 123456789,
		dob: "12/12/1950",
		starSign: "Leo"
	},
	{
		age: 51,
		name: "Yindi",
		lastName: "Killara",
		middleName: "Lowwana",
		address: "321 Awesome St, Somewhere nice",
		taxNumber: 987654321,
		dob: "01/05/1980",
		starSign: "Libra"
	},
	{	
		age: 35,
		name: "Freyja",
		lastName: "Balder",
		middleName: "Tyr",
		address: "9 Yggdrasil, In the sky",
		taxNumber: 999999999,
		dob: "29/05/1950",
		starSign: "Fehu"
	}
]

//The function should sum up the ages of all people in the array. 
//The answer is 175!

const SumAllTheAges = function(peoples) {
	//Your code here
}
```

This is quite a challenging problem if it's your first time. There are many different ways to solve it. Here are two possible solutions. But I'd strongly recommend you have a crack at it yourself before looking.

**Solution 1:**

```js
const SumAllTheAges = function(peoples) {
	const firstPersonAge = peoples[0].age
	const secondPersonAge = peoples[1].age
	const thirdPersonAge = peoples[2].age
	return firstPersonAge + secondPersonAge + thirdPersonAge
}
```

This works for this example but it doesn't really solve the general problem. If the array had different numbers of people, it wouldn't work.

**Solution 2:**

```js
const SumAllTheAges = function(peoples) {
	let ageSum = 0
	for (const person of peoples) {
		ageSum = ageSum + person.age
	}
	return ageSum
}
```

I know this uses stuff we haven't covered. But it solves the general problem. It works no matter how many people are in the list. This solution introduces the `for loop` and a new variable declaration `let`. But hopefully this gives you a taste for what you can achieve.

## Next step

You're ready for the next step: [Why tiles?](/tutorial/01-why-tiles)