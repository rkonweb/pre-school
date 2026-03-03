// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'summary_provider.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

String _$studentSummaryHash() => r'c30f2f1cd9c9c77e328fcf11474d40168e263d9f';

/// Copied from Dart SDK
class _SystemHash {
  _SystemHash._();

  static int combine(int hash, int value) {
    // ignore: parameter_assignments
    hash = 0x1fffffff & (hash + value);
    // ignore: parameter_assignments
    hash = 0x1fffffff & (hash + ((0x0007ffff & hash) << 10));
    return hash ^ (hash >> 6);
  }

  static int finish(int hash) {
    // ignore: parameter_assignments
    hash = 0x1fffffff & (hash + ((0x03ffffff & hash) << 3));
    // ignore: parameter_assignments
    hash = hash ^ (hash >> 11);
    return 0x1fffffff & (hash + ((0x00003fff & hash) << 15));
  }
}

abstract class _$StudentSummary
    extends BuildlessAutoDisposeAsyncNotifier<String?> {
  late final String studentId;
  late final String schoolSlug;

  FutureOr<String?> build(
    String studentId,
    String schoolSlug,
  );
}

/// See also [StudentSummary].
@ProviderFor(StudentSummary)
const studentSummaryProvider = StudentSummaryFamily();

/// See also [StudentSummary].
class StudentSummaryFamily extends Family<AsyncValue<String?>> {
  /// See also [StudentSummary].
  const StudentSummaryFamily();

  /// See also [StudentSummary].
  StudentSummaryProvider call(
    String studentId,
    String schoolSlug,
  ) {
    return StudentSummaryProvider(
      studentId,
      schoolSlug,
    );
  }

  @override
  StudentSummaryProvider getProviderOverride(
    covariant StudentSummaryProvider provider,
  ) {
    return call(
      provider.studentId,
      provider.schoolSlug,
    );
  }

  static const Iterable<ProviderOrFamily>? _dependencies = null;

  @override
  Iterable<ProviderOrFamily>? get dependencies => _dependencies;

  static const Iterable<ProviderOrFamily>? _allTransitiveDependencies = null;

  @override
  Iterable<ProviderOrFamily>? get allTransitiveDependencies =>
      _allTransitiveDependencies;

  @override
  String? get name => r'studentSummaryProvider';
}

/// See also [StudentSummary].
class StudentSummaryProvider
    extends AutoDisposeAsyncNotifierProviderImpl<StudentSummary, String?> {
  /// See also [StudentSummary].
  StudentSummaryProvider(
    String studentId,
    String schoolSlug,
  ) : this._internal(
          () => StudentSummary()
            ..studentId = studentId
            ..schoolSlug = schoolSlug,
          from: studentSummaryProvider,
          name: r'studentSummaryProvider',
          debugGetCreateSourceHash:
              const bool.fromEnvironment('dart.vm.product')
                  ? null
                  : _$studentSummaryHash,
          dependencies: StudentSummaryFamily._dependencies,
          allTransitiveDependencies:
              StudentSummaryFamily._allTransitiveDependencies,
          studentId: studentId,
          schoolSlug: schoolSlug,
        );

  StudentSummaryProvider._internal(
    super._createNotifier, {
    required super.name,
    required super.dependencies,
    required super.allTransitiveDependencies,
    required super.debugGetCreateSourceHash,
    required super.from,
    required this.studentId,
    required this.schoolSlug,
  }) : super.internal();

  final String studentId;
  final String schoolSlug;

  @override
  FutureOr<String?> runNotifierBuild(
    covariant StudentSummary notifier,
  ) {
    return notifier.build(
      studentId,
      schoolSlug,
    );
  }

  @override
  Override overrideWith(StudentSummary Function() create) {
    return ProviderOverride(
      origin: this,
      override: StudentSummaryProvider._internal(
        () => create()
          ..studentId = studentId
          ..schoolSlug = schoolSlug,
        from: from,
        name: null,
        dependencies: null,
        allTransitiveDependencies: null,
        debugGetCreateSourceHash: null,
        studentId: studentId,
        schoolSlug: schoolSlug,
      ),
    );
  }

  @override
  AutoDisposeAsyncNotifierProviderElement<StudentSummary, String?>
      createElement() {
    return _StudentSummaryProviderElement(this);
  }

  @override
  bool operator ==(Object other) {
    return other is StudentSummaryProvider &&
        other.studentId == studentId &&
        other.schoolSlug == schoolSlug;
  }

  @override
  int get hashCode {
    var hash = _SystemHash.combine(0, runtimeType.hashCode);
    hash = _SystemHash.combine(hash, studentId.hashCode);
    hash = _SystemHash.combine(hash, schoolSlug.hashCode);

    return _SystemHash.finish(hash);
  }
}

mixin StudentSummaryRef on AutoDisposeAsyncNotifierProviderRef<String?> {
  /// The parameter `studentId` of this provider.
  String get studentId;

  /// The parameter `schoolSlug` of this provider.
  String get schoolSlug;
}

class _StudentSummaryProviderElement
    extends AutoDisposeAsyncNotifierProviderElement<StudentSummary, String?>
    with StudentSummaryRef {
  _StudentSummaryProviderElement(super.provider);

  @override
  String get studentId => (origin as StudentSummaryProvider).studentId;
  @override
  String get schoolSlug => (origin as StudentSummaryProvider).schoolSlug;
}
// ignore_for_file: type=lint
// ignore_for_file: subtype_of_sealed_class, invalid_use_of_internal_member, invalid_use_of_visible_for_testing_member
