---
layout: post
title: Mastering HashMap: Common Interview Pitfalls and How to Avoid Them
date: 2025-04-13 07:30 -0300
categories: [Programação]
tags: [programação, Java, HashMap]  
---
# Mastering HashMap: Common Interview Pitfalls and How to Avoid Them

This guide is a resource to help developers understand HashMap usage in Java. It explains common interview problems, their impact on real-world applications, and how to solve or avoid them.

I decided to work on this because I was studying for some subjects that are common in live coding interviews. And writing down the things that I am studying and practicing helps me to understand everything better.

So, let's get down to business!

---

## Problem 1: Incorrect `hashCode()` and `equals()` Implementation

### Impact

Using objects as keys in a HashMap without correctly overriding `hashCode()` and `equals()` can result in lookup failures, duplicate entries, or missing values. HashMap uses the `hashCode()` to identify the bucket where the key might be stored, and then `equals()` to locate the correct key within that bucket. If these methods are not properly overridden, logically identical keys may be treated as different, leading to serious bugs.

### Purpose of `equals()` and `hashCode()` in HashMap

- **`hashCode()`**: Determines the bucket index for a key in the internal array of the HashMap. Efficient key lookup depends on a good hash distribution.
- **`equals()`**: When a key collision happens (i.e., two keys hash to the same bucket), `equals()` is used to distinguish between logically equal and unequal keys.

### Why Override These Methods

By default, Java uses the `Object` class's `equals()` and `hashCode()` methods:
- `equals()` uses reference equality (i.e., checks if two references point to the same object).
- `hashCode()` uses memory address-based hashing.

Overriding them ensures logical equality is respected, which is necessary when different object instances represent the same conceptual key.

### Incorrect Approach

```java
class User {
    String name;
    User(String name) { this.name = name; }
}

Map<User, String> map = new HashMap<>();
map.put(new User("Alice"), "Admin");
System.out.println(map.get(new User("Alice"))); // null
```

### Explanation

Even though both `User` objects represent "Alice", the default implementations of `equals()` and `hashCode()` consider them different due to distinct memory addresses.

### Correct Approach

```java
class User {
    String name;
    User(String name) { this.name = name; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        User user = (User) o;
        return Objects.equals(name, user.name);
    }

    @Override
    public int hashCode() {
        return Objects.hash(name);
    }
}

Map<User, String> map = new HashMap<>();
map.put(new User("Alice"), "Admin");
System.out.println(map.get(new User("Alice"))); // Admin
```

### Explanation

With proper overrides, two distinct `User` instances with the same name are considered equal, and hash to the same bucket. Thus, the key lookup succeeds.

---

## Problem 2: Concurrent Modification Issues

### Impact

Modifying a HashMap while iterating over it throws a `ConcurrentModificationException` in single-threaded contexts. In multi-threaded environments, it can lead to race conditions or corrupted state.

### Difference Between `HashMap` and `ConcurrentHashMap`

- **HashMap**: Not thread-safe. Concurrent access and modification can lead to unpredictable results, including infinite loops and data corruption.
- **ConcurrentHashMap**: Designed for thread safety. Allows concurrent read/write using internal locking mechanisms (e.g., lock striping or non-blocking algorithms). However, it is not a drop-in replacement in all cases—some compound operations may still require additional synchronization.

### Threads Overview

A **thread** is a lightweight unit of execution. Threads allow a program to perform multiple tasks concurrently.

- **Single-thread**: The program executes in a linear, step-by-step manner using a single thread.
- **Multi-thread**: Multiple threads execute simultaneously, possibly interacting with shared resources.

Multi-threading is useful for responsiveness and performance but introduces complexities like synchronization, deadlocks, and race conditions.

### Incorrect Approach

```java
Map<String, String> map = new HashMap<>();
map.put("a", "apple");
map.put("b", "banana");

for (String key : map.keySet()) {
    if (key.equals("a")) {
        map.remove(key); // ConcurrentModificationException
    }
}
```

### Explanation

Using `map.remove()` inside a loop that implicitly uses an iterator causes a `ConcurrentModificationException`, as the structure of the map is altered during iteration.

### Correct Approach (Single-threaded)

```java
Iterator<String> iterator = map.keySet().iterator();
while (iterator.hasNext()) {
    String key = iterator.next();
    if (key.equals("a")) {
        iterator.remove();
    }
}
```

### Correct Approach (Multi-threaded)

```java
Map<String, String> concurrentMap = new ConcurrentHashMap<>();
concurrentMap.put("x", "1");
concurrentMap.computeIfAbsent("y", k -> "2");
```

### Explanation

- `ConcurrentHashMap` supports safe concurrent operations.
- `computeIfAbsent()` ensures that the value is computed and inserted atomically if the key is absent.
- `putIfAbsent()` is another atomic method to insert only if the key isn't already present.

However, even with `ConcurrentHashMap`, certain compound actions are not atomic unless you use methods like `compute()` or external synchronization.

### Unsafe Compound Action Example

```java
if (!concurrentMap.containsKey("z")) {
    concurrentMap.put("z", "3"); // Not atomic
}
```

### Correct Atomic Alternative

```java
concurrentMap.computeIfAbsent("z", k -> "3");
```

### Important Notes

- `ConcurrentHashMap` does not allow `null` keys or values.
- It provides weakly consistent iterators that reflect the state of the map at some point during iteration, but not necessarily the state at start or end.
- Methods like `keySet()` followed by `get()` can still be unsafe if the map is modified between calls.
- `ConcurrentHashMap` is not suitable for operations that need a consistent snapshot of the map.

### Synchronization and Thread Completion

When using threads, ensure that all threads complete their work before you process or print results. Use `Thread.join()`:

```java
Thread t1 = new Thread(() -> concurrentMap.put("a", "1"));
Thread t2 = new Thread(() -> concurrentMap.put("b", "2"));
t1.start();
t2.start();
t1.join();
t2.join(); // Ensures both threads complete
```

This guarantees determinism in output by making sure all threads finish before accessing shared data.

---

## Problem 3: Hash Collisions and Performance

### Impact
If many keys share the same hash code, they end up in the same bucket, degrading the expected O(1) lookup time to O(n).

### Incorrect Approach
```java
class PoorHash {
    String id;
    PoorHash(String id) { this.id = id; }

    public int hashCode() { return 42; } // Constant hash code

    public boolean equals(Object o) {
        return o instanceof PoorHash && id.equals(((PoorHash) o).id);
    }
}
```

### Explanation
A constant hash code forces all entries into one bucket, effectively turning the HashMap into a linked list.

### Correct Approach
```java
class GoodHash {
    String id;
    GoodHash(String id) { this.id = id; }

    public int hashCode() { return Objects.hash(id); }

    public boolean equals(Object o) {
        return o instanceof GoodHash && id.equals(((GoodHash) o).id);
    }
}
```

### Explanation
`Objects.hash()` creates a distributed hash code, ensuring better performance.

### Appendix: Key Concepts for Problem 3

#### Buckets in HashMap
A bucket is a container in the internal array of a HashMap where entries with the same hash code are stored. When a key-value pair is inserted, the hash code of the key determines the bucket index. If multiple keys hash to the same bucket, they are stored in a linked list or balanced tree at that index. Efficient hash functions aim to spread entries evenly across buckets.

#### Big O Notation: O(1) vs O(n)
- **O(1)**: Constant time — the operation takes the same time regardless of the size of the dataset. Ideal for lookups in a well-distributed HashMap.
- **O(n)**: Linear time — the operation time increases linearly with the size of the dataset. This happens in HashMaps when many keys fall into the same bucket (i.e., in cases of hash collisions), degrading performance.

#### Difference Between HashMap and LinkedList
- **HashMap**: Stores key-value pairs with fast access (expected O(1)) based on hashing. No order is guaranteed.
- **LinkedList**: A sequential list where each element points to the next. Operations like search are O(n), and it's often used to handle collisions within a single HashMap bucket (chaining).

---

## Problem 4: `equals()` vs `==` Operator

### Concept
- `==` compares references (i.e., memory addresses). It's true only if both references point to the exact same object.
- `.equals()` compares *logical equality* based on the object's implementation of the `equals()` method.

### Why it matters in `HashMap`
`HashMap` uses `equals()` and `hashCode()` to locate keys. If two different `String` objects with the same content are compared with `==`, it will return `false`, but `equals()` will return `true` if their content is the same. Always use `equals()` to compare object values.

### Impact
Using `==` compares object references, not values. This leads to incorrect behavior when comparing logically equal but distinct objects.

### Incorrect Approach
```java
String a = new String("key");
String b = new String("key");
System.out.println(a == b); // false
```

### Explanation
`a` and `b` are different objects in memory, so `==` fails even though the content is the same.

### Correct Approach
```java
System.out.println(a.equals(b)); // true
```

### Explanation
`equals()` compares content, which is the intended logic when dealing with keys.

---

## Problem 5: Concurrent Modification

### Concept
- `HashMap` is **not thread-safe**. Concurrent reads/writes may lead to data corruption or `ConcurrentModificationException`.

### Safe Alternative
- Use `ConcurrentHashMap` for thread-safe operations.
- Avoid iterating with `.keySet()` and calling `.get()` inside the loop. Instead, use `forEach()` provided by the map itself, which is safer and consistent in concurrent settings.

### Atomicity
Even with `ConcurrentHashMap`, compound actions like "check then act" (`containsKey()` followed by `put()`) are not atomic unless you use atomic operations like `computeIfAbsent()`.

### Impact
Accessing a HashMap from multiple threads without synchronization leads to race conditions, lost updates, and possible exceptions.

### Incorrect Approach
```java
Map<String, String> map = new HashMap<>();
map.put("a", "apple");

new Thread(() -> map.put("b", "banana")).start();
for (String key : map.keySet()) {
    System.out.println(map.get(key));
}
```

### Explanation
`HashMap` is not thread-safe. Simultaneous modifications may lead to unpredictable results.

### Correct Approach
```java
Map<String, String> concurrentMap = new ConcurrentHashMap<>();

// Start two threads writing to the map
Thread writer1 = new Thread(() -> concurrentMap.put("x", "1"));
Thread writer2 = new Thread(() -> concurrentMap.computeIfAbsent("y", k -> "2"));

writer1.start();
writer2.start();

// Ensure both threads complete before reading
try {
    writer1.join();
    writer2.join();
} catch (InterruptedException e) {
    Thread.currentThread().interrupt();
}

// Safe concurrent read after all updates
concurrentMap.forEach((key, value) -> System.out.println(key + ": " + value));
```

### Explanation
`ConcurrentHashMap` allows multiple threads to read and write concurrently without throwing `ConcurrentModificationException`. Atomic methods like `computeIfAbsent`, `putIfAbsent`, and `remove(key, value)` help ensure thread-safety.

However, even read operations like iterating with `keySet()` followed by `get()` can be unsafe if modifications happen concurrently. Using higher-level methods like `forEach()` on `ConcurrentHashMap` helps avoid these issues.

Also, `ConcurrentHashMap` is not a drop-in replacement for `HashMap` in every case. It does not allow `null` keys or values and does not automatically make multi-step operations atomic. For example:

```java
// Not atomic, even in ConcurrentHashMap
if (!concurrentMap.containsKey("z")) {
    concurrentMap.put("z", "3");
}
```

This can lead to race conditions. To make this operation thread-safe:

```java
// Thread-safe atomic operation
concurrentMap.computeIfAbsent("z", k -> "3");
concurrentMap.put("a", "apple");

new Thread(() -> concurrentMap.put("b", "banana")).start();
concurrentMap.forEach((k, v) -> System.out.println(v));
```

### Explanation
`ConcurrentHashMap` allows concurrent read/write without external synchronization.

---

## Problem 6: Null Key Handling

### Concept
- `HashMap` allows one `null` key and multiple `null` values.
- If you call `map.get(key)` and get `null`, you can’t know if the key is absent or its value is `null`.

### Best Practice
- Always use `containsKey()` before accessing values to be sure.
- Java 8+ allows clearer handling with `Optional`, making the intention explicit.

### Impact
HashMap allows one null key, but unguarded use of nulls can confuse absence with value-null and lead to `NullPointerException`.

### Incorrect Approach
```java
Map<String, String> map = new HashMap<>();
map.put(null, "value");
System.out.println(map.get("nonexistent")); // null — ambiguous
```

### Explanation
A `null` result may mean the key doesn’t exist, or that the value is actually `null`.

### Correct Approach
```java
if (map.containsKey(key)) {
    System.out.println(map.get(key));
} else {
    System.out.println("Key not found");
}
```

Or:
```java
Optional.ofNullable(map.get(key)).ifPresentOrElse(
    val -> System.out.println("Found: " + val),
    () -> System.out.println("Not Found")
);
```

### Explanation
This explicitly separates existence checks from value retrieval.

---

## Problem 7: Load Factor and Performance Issues

### Concept
- `HashMap` grows automatically when its size exceeds `capacity * loadFactor`.
- Each resize operation is expensive because it rehashes all entries.

### Best Practice
- If you know your expected size, initialize the map with a larger capacity to prevent resizing.
  ```java
  new HashMap<>(expectedSize, 0.75f);
  ```

### Impact
When the number of entries exceeds capacity * load factor, the map resizes, which is expensive. Repeated resizing can degrade performance.

### Incorrect Approach
```java
Map<String, String> map = new HashMap<>(); // default: capacity=16
```

### Explanation
Default capacity is often too small for large data sets, leading to repeated resizes.

### Correct Approach
```java
int expectedSize = 1000;
float loadFactor = 0.75f;
Map<String, String> map = new HashMap<>(expectedSize, loadFactor);
```

### Explanation
Pre-sizing the map minimizes internal resizing, improving performance.

---

## Problem 8: Key Ordering and Map Implementations

### Concept
- HashMap does not guarantee any order of keys or values.
- Insertion order or natural key order must be handled explicitly.

### Alternatives
- LinkedHashMap preserves insertion order.
- TreeMap maintains sorted order (based on key's natural order or a provided comparator).

### Impact
HashMap makes no ordering guarantees. Relying on insertion or key order can result in incorrect logic.

### Incorrect Approach
```java
Map<String, Integer> map = new HashMap<>();
map.put("z", 1);
map.put("a", 2);
System.out.println(map); // unpredictable order
```

### Explanation
HashMap order varies with key hash codes and internal structure.

### Correct Approach
```java
Map<String, Integer> orderedMap = new LinkedHashMap<>();
orderedMap.put("z", 1);
orderedMap.put("a", 2);
System.out.println(orderedMap);

Map<String, Integer> sortedMap = new TreeMap<>();
sortedMap.put("z", 1);
sortedMap.put("a", 2);
System.out.println(sortedMap);
```

### Explanation
Use `LinkedHashMap` to preserve insertion order, or `TreeMap` for sorted keys.

---

## Problem 9: Serialization and Cloning

### Concept
- For an object to be serialized (e.g., saved to disk or sent over a network), it must implement Serializable.

- Shallow copying (e.g., new HashMap<>(oldMap)) copies references, not the objects themselves.

### Deep Cloning
To avoid shared state and potential bugs, deep clone the values using serialization, assuming all objects involved are serializable.

### Impact
Maps containing non-serializable objects cannot be serialized. Copying such maps without deep cloning leads to shared mutable state.

### Incorrect Approach
```java
class Person {
    String name;
}

Map<String, Person> map = new HashMap<>();
// Serialization will fail
```

### Explanation
`Person` must implement `Serializable` to allow map serialization.

### Correct Approach
```java
class Person implements Serializable {
    private static final long serialVersionUID = 1L;
    String name;
}

Map<String, Person> map = new HashMap<>();
```

For deep cloning:
```java
public static <T extends Serializable> T deepClone(T object) {
    try (ByteArrayOutputStream bos = new ByteArrayOutputStream();
         ObjectOutputStream out = new ObjectOutputStream(bos)) {
        out.writeObject(object);
        try (ObjectInputStream in = new ObjectInputStream(
                new ByteArrayInputStream(bos.toByteArray()))) {
            return (T) in.readObject();
        }
    } catch (Exception e) {
        throw new RuntimeException(e);
    }
}
```

### Explanation
This utility method performs a full deep clone via Java serialization.

---

## Best Practices Recap

### For HashMap Keys
- Always override `hashCode()` and `equals()`.
- Prefer immutable keys.
- Avoid using mutable fields in keys.

### For Concurrent Access
- Use `ConcurrentHashMap`.
- Avoid direct modification during iteration.
- Use atomic compute/merge operations.

### For Performance
- Tune initial capacity and load factor.
- Profile and monitor collision rates.
- Use the correct Map implementation based on ordering and concurrency needs.

### For Safety and Clarity
- Document null behavior explicitly.
- Test edge cases: nulls, empties, duplicates, concurrency.
- Include custom `toString()` methods for easier debugging.

---

## Further Reading
- [Java HashMap Documentation](https://docs.oracle.com/en/java/javase/11/docs/api/java.base/java/util/HashMap.html)

I created a [repository](https://github.com/DanielGMesquita/hashmap-exercises) on my GitHub if you interest to see how it works.

Hope it can be useful! See ya!